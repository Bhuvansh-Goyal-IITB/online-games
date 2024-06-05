"use client";

import React, { FC } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import { ChessContextProvider } from "@ui/chess/ChessContextProvider";
import { GameSidePanel } from "@ui/chess/GameSidePanel";

const Page: FC = () => {
  return (
    <div className="w-full h-full bg-background flex justify-center items-center">
      <ChessContextProvider>
        <div className="flex gap-4">
          <div className="overflow-hidden">
            <ChessBoard />
          </div>
          <div className="h-full">
            <GameSidePanel />
          </div>
        </div>
      </ChessContextProvider>
    </div>
  );
};

export default Page;
