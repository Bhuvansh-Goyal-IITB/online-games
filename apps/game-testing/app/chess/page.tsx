"use client";

import React, { FC } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import { ChessContextProvider } from "@ui/chess/ChessContextProvider";
import { GameSidePanel } from "@ui/chess/GameSidePanel";

const Page: FC = () => {
  return (
    <div className="w-full min-h-[100%] p-8 bg-background flex justify-center lg:items-center">
      <ChessContextProvider>
        <div className="flex flex-col lg:flex-row gap-4">
          <div>
            <div className="overflow-hidden h-fit w-fit border-yellow-950 border-[6px] rounded-md">
              <ChessBoard />
            </div>
          </div>
          <GameSidePanel />
        </div>
      </ChessContextProvider>
    </div>
  );
};

export default Page;
