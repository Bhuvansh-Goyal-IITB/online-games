"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocketContext } from "@ui/socket/socketContext";
import AuthPopup from "@/components/AuthPopup";
import { useSession } from "next-auth/react";

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
    console.log(session.status, authPopupShown);
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
    } else {
      alert("Cannot connect to server");
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full bg-muted">
      {session.status == "unauthenticated" && !authPopupShown && (
        <AuthPopup setAuthPopupShown={setAuthPopupShown} />
      )}
      <div className="hidden h-full xl:flex justify-center items-center w-1/2">
        <img
          className="max-w-[700px] w-[90%]"
          src="/chess_board.webp"
          alt="chess board"
        />
      </div>
      <div className="h-full flex items-center justify-center w-full xl:w-1/2 bg-background">
        <div>
          <div className="flex flex-col gap-10">
            <Button
              disabled={
                session.status == "loading" ||
                (session.status == "unauthenticated" && !authPopupShown)
              }
              className="p-8 text-xl"
              size="lg"
              onClick={handleCreateGame}
            >
              Create Game
            </Button>
            <Button
              disabled={
                session.status == "loading" ||
                (session.status == "unauthenticated" && !authPopupShown)
              }
              className="p-8 text-xl"
              size="lg"
              onClick={handleOnlineGame}
            >
              Play Online
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
