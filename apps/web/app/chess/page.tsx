"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@ui/socket/socketContext";
import AuthPopup from "@/components/AuthPopup";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@ui/components/ui/card";

export default function Page() {
  const session = useSession();

  const [authPopupShown, setAuthPopupShown] = useState(false);
  const { sendMessage, message, readyState } = useSocketContext();
  const [waiting, setWaiting] = useState(false);
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

  useEffect(() => {
    if (session.status == "unauthenticated" && authPopupShown) {
      sendMessage(
        JSON.stringify({
          event: "auth",
          data: {
            id: localStorage.getItem("id")!,
            isGuest: true,
          },
        })
      );
    } else if (session.status == "authenticated") {
      sendMessage(
        JSON.stringify({
          event: "auth",
          data: {
            id: session.data.user?.id!,
            isGuest: false,
          },
        })
      );
    }
  }, [session.status, authPopupShown]);

  const handleCreateGame = () => {
    if (readyState == 1) {
      sendMessage(
        JSON.stringify({
          event: "create game",
        })
      );
    } else {
      alert("Cannot connect to server");
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
      alert("Cannot connect to server");
    }
  };

  console.log(session, authPopupShown);

  return (
    <div className="flex justify-center items-center w-full h-full bg-background">
      {session.status == "unauthenticated" && !authPopupShown && (
        <AuthPopup setAuthPopupShown={setAuthPopupShown} />
      )}
      {waiting && (
        <div className="w-full h-full absolute top-0 left-0 flex justify-center items-center z-[1]">
          <Card>
            <CardContent className="flex justify-center items-center p-6">
              Searching for players...
            </CardContent>
          </Card>
        </div>
      )}
      <div>
        <div className="flex flex-col gap-10">
          <Button
            disabled={
              session.status == "loading" ||
              (session.status == "unauthenticated" && !authPopupShown) ||
              waiting
            }
            size="lg"
            onClick={handleCreateGame}
          >
            Create Game
          </Button>
          <Button
            disabled={
              session.status == "loading" ||
              (session.status == "unauthenticated" && !authPopupShown) ||
              waiting
            }
            size="lg"
            onClick={handleOnlineGame}
          >
            Play Online
          </Button>
        </div>
      </div>
    </div>
  );
}
