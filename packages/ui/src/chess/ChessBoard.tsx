"use client";

import { FC } from "react";
import { useChessContext } from "./chessContext";
import { Piece } from "./Piece";

interface ChessBoardProps {}

export const ChessBoard: FC<ChessBoardProps> = () => {
  const { pieceList, validMoves, lastMove } = useChessContext();

  return (
    <div
      className="relative max-w-[760px] max-h-[760px]"
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <img src="/board.svg" />

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
    </div>
  );
};
