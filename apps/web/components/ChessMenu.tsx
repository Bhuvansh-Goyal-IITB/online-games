"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useSocketContext } from "@ui/context/socketContext";
import { useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import { toast } from "@repo/ui/components/ui/sonner";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { createId } from "@paralleldrive/cuid2";

interface ChessMenuProps {
  id?: string;
}

const ChessMenu: FC<ChessMenuProps> = ({ id }) => {
  const { sendMessage, lastMessage, readyState } = useSocketContext();
  const [waiting, setWaiting] = useState(false);
  const router = useRouter();

  const handleCreateGame = () => {
    if (readyState == 1) {
      sendMessage(
        JSON.stringify({
          event: "create game",
        })
      );
    } else {
      toast.error("Cannot connect to server");
    }
  };

  const handleOnlineGame = () => {
    if (readyState == 1) {
      sendMessage(
        JSON.stringify({
          event: "random game",
        })
      );
      setWaiting(true);
    } else {
      toast.error("Cannot connect to server");
    }
  };

  useEffect(() => {
    if (lastMessage) {
      const message = lastMessage.data;
      const parsedData = JSON.parse(message);

      if (parsedData.event == "gameId") {
        const gameId = parsedData.data.gameId;
        router.push(`/chess/${gameId}`);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (id == undefined) {
      let guestId = localStorage.getItem("id");

      if (!guestId) {
        guestId = createId();
        localStorage.setItem("id", guestId);
      }

      sendMessage(
        JSON.stringify({
          event: "auth",
          data: {
            id: guestId,
            isGuest: true,
          },
        })
      );
    } else {
      sendMessage(
        JSON.stringify({
          event: "auth",
          data: {
            id,
            isGuest: false,
          },
        })
      );
    }
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {waiting && (
        <div className="w-full h-full absolute top-0 left-0 flex justify-center items-center z-[1]">
          <Card>
            <CardContent className="flex justify-center items-center p-6">
              Searching for players...
            </CardContent>
          </Card>
        </div>
      )}
      <Button disabled={waiting} size="lg" onClick={handleCreateGame}>
        Create Game
      </Button>
      <Button disabled={waiting} size="lg" onClick={handleOnlineGame}>
        Play Online
      </Button>
    </div>
  );
};

export default ChessMenu;
