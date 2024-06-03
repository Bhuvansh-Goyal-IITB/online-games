"use client";

import React, { FC } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import { useChessContext } from "@ui/chess/chessContext";
import { Button } from "@ui/components/ui/button";

const Page: FC = () => {
  const { previous, next } = useChessContext();

  return (
    <div className="w-full h-full bg-background flex justify-center items-center">
      <div className="flex gap-4">
        <div className="overflow-hidden">
          <ChessBoard />
        </div>
        <div className="flex gap-2">
          <Button onClick={previous}>Prev</Button>
          <Button onClick={next}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
