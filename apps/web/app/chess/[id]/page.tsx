import React, { FC } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import { ChessContextProvider } from "@ui/chess/ChessContextProvider";
import { GameSidePanel } from "@ui/chess/GameSidePanel";
import { SocketHandler } from "@/app/components/SocketHandler";

export const runtime = "edge";

interface PageProps {
  params: { id: string };
}

const Page: FC<PageProps> = ({ params }) => {
  return (
    <div className="w-full min-h-[100%] p-8 bg-background-muted flex justify-center lg:items-center">
      <ChessContextProvider>
        <SocketHandler gameId={params.id} />
        <div className="relative flex flex-col lg:flex-row gap-4">
          <div className="h-full grow-[2]">
            <ChessBoard />
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
