import React, { FC } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import { ChessContextProvider } from "@ui/chess/ChessContextProvider";
import { GameSidePanel } from "@ui/chess/GameSidePanel";
import { GameInfo } from "@ui/chess/GameInfo";

const Page: FC = () => {
  return (
    <div className="w-full min-h-[100%] p-8 bg-background-muted flex justify-center lg:items-center">
      <ChessContextProvider selfGame>
        <div className="relative flex flex-col lg:flex-row gap-4">
          <div className="h-full grow-[2]">
            <GameInfo
              abortData={{
                leftPlayer: "w",
                time: 80,
              }}
              timeData={{
                w: 201,
                b: 120,
              }}
            >
              <ChessBoard />
            </GameInfo>
          </div>
          <div className="min-h-full grow-0">
            <GameSidePanel />
          </div>
        </div>
      </ChessContextProvider>
    </div>
  );
};

export default Page;
