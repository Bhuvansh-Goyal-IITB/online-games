"use client";

import { FC, MouseEventHandler, useEffect } from "react";
import { useChessContext } from "../context/chessContext";
import { Piece } from "./Piece";
import { PromotionMenu } from "./PromotionMenu";
import { Chess } from "@repo/chess";
import { Check, LastMove, SelectedPiece, ValidMoves } from "./BoardHighlights";
import { GameOverScreen } from "./GameOverScreen";

export const ChessBoard: FC = () => {
  const {
    pieceList,
    selectedPiece,
    validMoves,
    preferences: { flip },
    movePiece,
    setPromotionMove,
    setSelectedPiece,
  } = useChessContext();

  const handleMouseDown: MouseEventHandler = (event) => {
    const { top, left, right } = event.currentTarget.getBoundingClientRect();

    const pieceWidth = Math.abs(right - left) / 8;

    const col = Math.floor((event.clientX - left) / pieceWidth);
    const row = Math.floor((event.clientY - top) / pieceWidth);

    const displayMouseUpPosition = row * 8 + col;
    const mouseUpPosition = flip
      ? 63 - displayMouseUpPosition
      : displayMouseUpPosition;

    if (0 <= row && row <= 7 && 0 <= col && col <= 7 && selectedPiece) {
      const selectedMove = validMoves
        .filter((move) => move[0] == selectedPiece.position)
        .find((move) => move[1] == mouseUpPosition);

      if (selectedMove) {
        if (
          selectedPiece.pieceType == "p" &&
          ((selectedPiece.color == "w" && mouseUpPosition <= 7) ||
            (selectedPiece.color == "b" && mouseUpPosition >= 56))
        ) {
          setPromotionMove([selectedMove[0]!, selectedMove[1]!]);
          setSelectedPiece(null);
        } else {
          movePiece(
            `${Chess.position_to_algebraic(selectedMove[0]!)}${Chess.position_to_algebraic(selectedMove[1]!)}`,
          );
          setSelectedPiece(null);
        }
      } else if (
        pieceList.find((piece) => piece.position == mouseUpPosition) ==
        undefined
      ) {
        setSelectedPiece(null);
      }
    }
  };

  useEffect(() => {
    setSelectedPiece(null);
  }, [pieceList]);

  return (
    <div
      className="relative max-w-[70vh] max-h-[70vh] border-yellow-900 border-[6px] overflow-hidden rounded-md"
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={handleMouseDown}
    >
      <img src={flip ? "/board-flip.svg" : "/board.svg"} />
      <GameOverScreen />
      <PromotionMenu />
      {pieceList.map((piece) => (
        <Piece
          key={piece.id}
          color={piece.color}
          pieceType={piece.pieceType}
          position={piece.position}
          validMoves={validMoves
            .filter((move) => move[0] == piece.position)
            .map((move) => move[1]!)}
        />
      ))}
      <Check />
      <LastMove />
      <SelectedPiece />
      <ValidMoves />
    </div>
  );
};
