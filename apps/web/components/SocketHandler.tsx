"use client";

import { createId } from "@paralleldrive/cuid2";
import { Chess, Color, PieceType } from "@repo/chess";
import { useChessContext } from "@ui/chess/chessContext";
import { useSocketContext } from "@ui/socket/socketContext";
import { useSession } from "next-auth/react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

interface SocketHandlerProps {
  gameId: string;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
}

export const SocketHandler: FC<SocketHandlerProps> = ({
  gameId,
  setErrorMessage: setError,
  setLoading,
}) => {
  const {
    moveList,
    lastMove,
    playerColor,
    movePiece,
    loadMoves,
    setCurrentPlayerColor,
    startGame,
    setPreferences,
  } = useChessContext();
  const { sendMessage, message } = useSocketContext();
  const session = useSession();
  const [movesMade, setMovesMade] = useState(0);

  useEffect(() => {
    if (moveList.length != movesMade) {
      setMovesMade(moveList.length);

      if (moveList.length > 0) {
        if (
          ((playerColor == "w" && moveList.length % 2 != 0) ||
            (playerColor == "b" && moveList.length % 2 == 0)) &&
          lastMove
        ) {
          if (lastMove.notation.includes("=")) {
            const promoteTo = lastMove.notation
              .split("=")[1]!
              .charAt(0)
              .toLowerCase() as Exclude<PieceType, "k" | "p">;

            sendMessage(
              JSON.stringify({
                event: "move",
                data: {
                  gameId,
                  move: `${Chess.position_to_algebraic(lastMove.move[0]!)}${Chess.position_to_algebraic(lastMove.move[1]!)}${promoteTo}`,
                },
              })
            );
          } else {
            sendMessage(
              JSON.stringify({
                event: "move",
                data: {
                  gameId,
                  move: `${Chess.position_to_algebraic(lastMove.move[0]!)}${Chess.position_to_algebraic(lastMove.move[1]!)}`,
                },
              })
            );
          }
        }
      }
    }
  }, [moveList]);

  useEffect(() => {
    if (message) {
      const parsedData = JSON.parse(message);

      if (parsedData.event == "total moves") {
        const moves = parsedData.data.moves as string;
        if (moves != "") {
          loadMoves(moves.split(","));
        }
      } else if (parsedData.event == "game started") {
        setLoading(false);
        const playerColor = parsedData.data.color as Color;
        setCurrentPlayerColor(playerColor);
        if (playerColor == "b") {
          setPreferences((prev) => ({
            ...prev,
            flip: true,
          }));
        }
        startGame();
      } else if (parsedData.event == "move") {
        const moveString = parsedData.data.move as string;
        movePiece(moveString);
      } else if (parsedData.event == "game joined") {
        setLoading(false);
        const playerColor = parsedData.data.color as Color;
        setCurrentPlayerColor(playerColor);
        if (playerColor == "b") {
          setPreferences((prev) => ({
            ...prev,
            flip: true,
          }));
        }
      } else if (parsedData.event == "error") {
        setLoading(false);
        const data = parsedData.data;

        if (data.message && typeof data.message == "string") {
          setError(data.message);
        } else {
          setError("Something went wrong");
        }
      }
    }
  }, [message]);

  useEffect(() => {
    if (session.status != "loading") {
      if (session.status == "authenticated" && session.data.user) {
        sendMessage(
          JSON.stringify({
            event: "auth",
            data: {
              id: session.data.user.id,
              isGuest: false,
            },
          })
        );
      } else {
        if (!localStorage.getItem("id")) {
          const newId = createId();
          localStorage.setItem("id", newId);

          sendMessage(
            JSON.stringify({
              event: "auth",
              data: {
                id: newId,
                isGuest: true,
              },
            })
          );
        } else {
          sendMessage(
            JSON.stringify({
              event: "auth",
              data: {
                id: localStorage.getItem("id"),
                isGuest: true,
              },
            })
          );
        }
      }

      sendMessage(
        JSON.stringify({
          event: "join game",
          data: {
            gameId,
          },
        })
      );
    }
  }, [session.status]);
  return <></>;
};
