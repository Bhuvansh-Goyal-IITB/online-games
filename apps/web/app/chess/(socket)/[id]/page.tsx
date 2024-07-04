"use client";

import React, { FC } from "react";
import { ChessBoard } from "@repo/ui/chess/ChessBoard";
import { GameSidePanel } from "@repo/ui/chess/GameSidePanel";
import { useChessGameHandler } from "@/hooks/useChessGameHandler";
import { Loader2 } from "lucide-react";

export const runtime = "edge";

interface PageProps {
  params: { id: string };
}

const Page: FC<PageProps> = ({ params }) => {
  const { loading, onResign, onDraw } = useChessGameHandler(params.id);

  return (
    <>
      {loading ? (
        <div className="w-full h-full flex justify-center items-center text-lg">
          <div className="flex gap-2">
            <Loader2 className="size-6 animate-spin" />
          </div>
          Loading...
        </div>
      ) : (
        <div className="relative flex flex-col lg:flex-row gap-4">
          <div className="h-full grow-[2]">
            <ChessBoard />
          </div>
          <div className="min-h-full grow-0">
            <GameSidePanel onResign={onResign} onDraw={onDraw} />
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
