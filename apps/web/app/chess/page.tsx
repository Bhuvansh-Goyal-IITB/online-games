"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useWebSocket } from "@/app/components/SocketProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { socket, message } = useWebSocket();
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
            if (socket && socket.readyState == 1) {
              socket.send(
                JSON.stringify({
                  event: "create game",
                })
              );
            } else {
              alert("Cannot connect to server");
            }
          }}
          size="lg"
        >
          Create Game
        </Button>
        <Button
          size="lg"
          onClick={() => {
            if (socket && socket.readyState == 1) {
              socket.send(
                JSON.stringify({
                  event: "random game",
                })
              );
            } else {
              alert("Cannot connect to server");
            }
          }}
        >
          Vs Random
        </Button>
      </div>
    </div>
  );
}
