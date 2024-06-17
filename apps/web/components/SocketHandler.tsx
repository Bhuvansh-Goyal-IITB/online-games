"use client";

import { createId } from "@paralleldrive/cuid2";
import { Chess, Color, PieceType } from "@repo/chess";
import { IPlayerInfo } from "@repo/ui/chess/ChessContextProvider";
import { useChessContext } from "@repo/ui/context/chessContext";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useSession } from "next-auth/react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { toast } from "@repo/ui/components/ui/sonner";

interface SocketHandlerProps {
  gameId: string;
  setWhitePlayerInfo: Dispatch<SetStateAction<IPlayerInfo | null>>;
  setBlackPlayerInfo: Dispatch<SetStateAction<IPlayerInfo | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
}

export const SocketHandler: FC<SocketHandlerProps> = ({
  gameId,
  setWhitePlayerInfo,
  setBlackPlayerInfo,
  setLoading,
  setErrorMessage,
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
    resign,
    draw,
  } = useChessContext();
  const { sendMessage, lastMessage, readyState } = useSocketContext();
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
    if (lastMessage) {
      const message = lastMessage.data;
      const parsedData = JSON.parse(message);

      if (parsedData.event == "Authorized") {
        sendMessage(
          JSON.stringify({
            event: "join game",
            data: {
              gameId,
            },
          })
        );
      } else if (parsedData.event == "total moves") {
        const moves = parsedData.data.moves as string;
        if (moves != "") {
          loadMoves(moves.split(","));
        }
      } else if (parsedData.event == "game started") {
        setLoading(false);
        const playerColor = parsedData.data.color as Color;
        const opponentData = parsedData.data.opponentData as {
          name: string;
          image: string | null;
        };
        setCurrentPlayerColor(playerColor);
        if (playerColor == "b") {
          setPreferences((prev) => ({
            ...prev,
            flip: true,
          }));
        }
        if (session.status == "unauthenticated") {
          if (playerColor == "w") {
            setWhitePlayerInfo({
              name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
            });
            setBlackPlayerInfo({
              name: opponentData.name,
              profileImageSrc: opponentData.image ?? undefined,
            });
          } else {
            setBlackPlayerInfo({
              name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
            });
            setWhitePlayerInfo({
              name: opponentData.name,
              profileImageSrc: opponentData.image ?? undefined,
            });
          }
        } else {
          if (playerColor == "w") {
            setWhitePlayerInfo({
              name: `${session.data!.user!.name!}`,
              profileImageSrc: session.data!.user!.image ?? undefined,
            });
            setBlackPlayerInfo({
              name: opponentData.name,
              profileImageSrc: opponentData.image ?? undefined,
            });
          } else {
            setBlackPlayerInfo({
              name: `${session.data!.user!.name!}`,
              profileImageSrc: session.data!.user!.image ?? undefined,
            });
            setWhitePlayerInfo({
              name: opponentData.name,
              profileImageSrc: opponentData.image ?? undefined,
            });
          }
        }

        startGame();
      } else if (parsedData.event == "move") {
        const moveString = parsedData.data.move as string;
        movePiece(moveString);
      } else if (parsedData.event == "game joined") {
        setLoading(false);
        const playerColor = parsedData.data.color as Color;

        if (session.status == "unauthenticated") {
          playerColor == "w"
            ? setWhitePlayerInfo({
                name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
              })
            : setBlackPlayerInfo({
                name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
              });
        } else {
          playerColor == "w"
            ? setWhitePlayerInfo({
                name: `${session.data!.user!.name!}`,
                profileImageSrc: session.data!.user!.image ?? undefined,
              })
            : setBlackPlayerInfo({
                name: `${session.data!.user!.name!}`,
                profileImageSrc: session.data!.user!.image ?? undefined,
              });
        }

        setCurrentPlayerColor(playerColor);
        if (playerColor == "b") {
          setPreferences((prev) => ({
            ...prev,
            flip: true,
          }));
        }
      } else if (parsedData.event == "resign") {
        const color = parsedData.data.color as Color;
        resign(color);
      } else if (parsedData.event == "draw offer") {
        toast("Opponent offered a draw", {
          action: {
            label: "Accept",
            onClick: () => {
              sendMessage(
                JSON.stringify({
                  event: "draw accept",
                  data: {
                    gameId,
                  },
                })
              );
            },
          },
          cancel: {
            label: "Reject",
            onClick: () => {
              sendMessage(
                JSON.stringify({
                  event: "draw reject",
                  data: {
                    gameId,
                  },
                })
              );
            },
          },
        });
      } else if (parsedData.event == "draw reject") {
        toast("Opponent rejected the draw offer");
      } else if (parsedData.event == "draw accept") {
        draw();
      } else if (parsedData.event == "error") {
        setLoading(false);
        const data = parsedData.data;

        if (data.message && typeof data.message == "string") {
          setErrorMessage(data.message);
        } else {
          setErrorMessage("Something went wrong");
        }
      }
    }
  }, [lastMessage]);

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
    }
  }, [session.status]);

  useEffect(() => {
    if (readyState == 3) {
      setLoading(false);
      setErrorMessage("Error connecting to server");
    }
  }, [readyState]);
  return <></>;
};
