"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@/app/components/SocketProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { sendMessage, message } = useSocketContext();
  const router = useRouter();

  useEffect(() => {
    if (message) {
      const parsedData = JSON.parse(message);

      if (parsedData.event == "gameId") {
        const gameId = parsedData.data.gameId;
        router.push(`/chess/${gameId}`);
      }
    }
  }, [message]);

  return (
    <div className="flex justify-center items-center w-full h-full bg-background">
      <div className="flex flex-col gap-4">
        <Button
          onClick={() => {
            sendMessage(
              JSON.stringify({
                event: "create game",
              })
            );
          }}
          size="lg"
        >
          Create Game
        </Button>
        <Button
          size="lg"
          onClick={() => {
            sendMessage(
              JSON.stringify({
                event: "random game",
              })
            );
          }}
        >
          Vs Random
        </Button>
      </div>
    </div>
  );
}
