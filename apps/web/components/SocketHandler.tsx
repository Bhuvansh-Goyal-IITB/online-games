"use client";

import { Chess, Color, PieceType } from "@repo/chess";
import { useChessContext } from "@ui/chess/chessContext";
import { useSocketContext } from "@ui/socket/socketContext";
import { FC, useEffect, useState } from "react";

interface SocketHandlerProps {
  gameId: string;
}

export const SocketHandler: FC<SocketHandlerProps> = ({ gameId }) => {
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
      }
    }
  }, [message]);

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        event: "join game",
        data: {
          gameId,
        },
      })
    );
  }, []);
  return <></>;
};
