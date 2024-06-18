"use client";

import React, { FC, useState } from "react";
import { ChessBoard } from "@repo/ui/chess/ChessBoard";
import {
  ChessContextProvider,
  IPlayerInfo,
} from "@repo/ui/chess/ChessContextProvider";
import { GameSidePanel } from "@repo/ui/chess/GameSidePanel";
import { SocketHandler } from "@/components/SocketHandler";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { useSocketContext } from "@repo/ui/context/socketContext";

export const runtime = "edge";

interface PageProps {
  params: { id: string };
}

const Page: FC<PageProps> = ({ params }) => {
  const { sendMessage } = useSocketContext();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [whitePlayerInfo, setWhitePlayerInfo] = useState<IPlayerInfo | null>(
    null
  );
  const [blackPlayerInfo, setBlackPlayerInfo] = useState<IPlayerInfo | null>(
    null
  );

  const onResign = () => {
    sendMessage(
      JSON.stringify({
        event: "resign",
        data: {
          gameId: params.id,
        },
      })
    );
  };

  const onDraw = () => {
    sendMessage(
      JSON.stringify({
        event: "draw offer",
        data: {
          gameId: params.id,
        },
      })
    );
  };
  return (
    <div
      className={`w-full min-h-[100%] p-8 bg-background flex justify-center ${!errorMessage && !loading ? "lg:items-center" : "items-center"}`}
    >
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
          <div className="w-full h-full flex justify-center items-center text-xl">
            Loading...
          </div>
        ) : errorMessage ? (
          <div className="w-full h-full flex flex-col justify-center items-center gap-4 text-xl">
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
              <GameSidePanel onResign={onResign} onDraw={onDraw} />
            </div>
          </div>
        )}
      </ChessContextProvider>
    </div>
  );
};

export default Page;
