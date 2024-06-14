"use client";

import React, { FC, useCallback, useState } from "react";
import { ChessBoard } from "@ui/chess/ChessBoard";
import { ChessContextProvider } from "@ui/chess/ChessContextProvider";
import { GameSidePanel } from "@ui/chess/GameSidePanel";
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

  return (
    <div className="w-full min-h-[100%] p-8 bg-background-muted flex justify-center lg:items-center">
      <ChessContextProvider>
        <SocketHandler
          gameId={params.id}
          setLoading={setLoading}
          setErrorMessage={setErrorMessage}
        />
        {loading ? (
          <div className="text-2xl">Loading...</div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center gap-4 text-2xl">
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
