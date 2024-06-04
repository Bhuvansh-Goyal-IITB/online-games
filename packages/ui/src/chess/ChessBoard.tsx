"use client";

import { FC } from "react";
import { useChessContext } from "./chessContext";
import { Piece } from "./Piece";
import { PromotionMenu } from "./PromotionMenu";

const SelectedPiece: FC = () => {
  const {
    preferences: { flip },
    selectedPiece,
  } = useChessContext();

  return (
    <>
      {selectedPiece && (
        <div
          style={{
            left: `${(((flip ? 63 - selectedPiece.position : selectedPiece.position) % 8) * 100) / 8}%`,
            top: `${(Math.floor((flip ? 63 - selectedPiece.position : selectedPiece.position) / 8) * 100) / 8}%`,
          }}
          className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
        />
      )}
    </>
  );
};

export const ChessBoard: FC = () => {
  const { pieceList, validMoves, outcome } = useChessContext();

  const handleMouseDown = (event: MouseEvent) => {};

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
      <PromotionMenu />
      <SelectedPiece />
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
