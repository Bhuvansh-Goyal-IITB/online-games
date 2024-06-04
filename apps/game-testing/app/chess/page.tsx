"use client";

import React, { FC } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import { useChessContext } from "@ui/chess/chessContext";
import { Button } from "@ui/components/ui/button";
import { ChessContextProvider } from "@ui/chess/ChessContextProvider";

const SideButtons: FC = () => {
  const { previous, next, setPreferences } = useChessContext();
  return (
    <div className="flex gap-2">
      <Button onClick={previous}>Prev</Button>
      <Button onClick={next}>Next</Button>
      <Button
        onClick={() => {
          setPreferences((prev) => ({
            ...prev,
            flip: !prev.flip,
          }));
        }}
      >
        Flip
      </Button>
    </div>
  );
};

const Page: FC = () => {
  return (
    <div className="w-full h-full bg-background flex justify-center items-center">
      <ChessContextProvider>
        <div className="flex gap-4">
          <div className="overflow-hidden">
            <ChessBoard />
          </div>
          <SideButtons />
        </div>
      </ChessContextProvider>
    </div>
  );
};

export default Page;
