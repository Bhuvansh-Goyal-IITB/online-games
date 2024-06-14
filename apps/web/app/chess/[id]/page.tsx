"use client";

import React, { FC, useCallback, useRef, useState } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import {
  ChessContextProvider,
  IPlayerInfo,
} from "@repo/ui/chess/ChessContextProvider";
import { GameSidePanel } from "@repo/ui/chess/GameSidePanel";
import { SocketHandler } from "@/components/SocketHandler";
import { Button } from "@ui/components/ui/button";
import Link from "next/link";

export const runtime = "edge";

interface PageProps {
  params: { id: string };
}

const Page: FC<PageProps> = ({ params }) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [whitePlayerInfo, setWhitePlayerInfo] = useState<IPlayerInfo | null>(
    null
  );
  const [blackPlayerInfo, setBlackPlayerInfo] = useState<IPlayerInfo | null>(
    null
  );

  return (
    <div className="w-full min-h-[100%] p-8 bg-background flex justify-center lg:items-center">
      <ChessContextProvider
        whitePlayerInfo={whitePlayerInfo ?? undefined}
        blackPlayerInfo={blackPlayerInfo ?? undefined}
      >
        <SocketHandler
          gameId={params.id}
          setWhitePlayerInfo={setWhitePlayerInfo}
          setBlackPlayerInfo={setBlackPlayerInfo}
          setLoading={setLoading}
          setErrorMessage={setErrorMessage}
        />
        {loading ? (
          <div className="text-xl">Loading...</div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center gap-4 text-xl">
            {errorMessage}
            <div>
              <Button asChild>
                <Link href="/chess">Back</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col lg:flex-row gap-4">
            <div className="h-full grow-[2]">
              <ChessBoard />
            </div>
            <div className="min-h-full grow-0">
              <GameSidePanel />
            </div>
          </div>
        )}
      </ChessContextProvider>
    </div>
  );
};

export default Page;
