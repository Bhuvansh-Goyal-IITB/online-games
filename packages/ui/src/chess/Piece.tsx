"use client";

import { Color, PieceType } from "@repo/chess";
import React, { FC } from "react";

interface PieceProps {
  position: number;
  color: Color;
  pieceType: PieceType;
}

export const Piece: FC<PieceProps> = ({ position, color, pieceType }) => {
  return (
    <div
      style={{
        left: `${((position % 8) * 100) / 8}%`,
        top: `${(Math.floor(position / 8) * 100) / 8}%`,
      }}
      className="absolute flex justify-center items-center w-[12.5%] h-[12.5%]"
    >
      <img src={`/cardinal/${color}/${pieceType}.svg`} />
    </div>
  );
};
