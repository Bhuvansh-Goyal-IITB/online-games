"use client";

import { useSocketContext } from "@ui/context/socketContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const { sendMessage, authorized, on } = useSocketContext();
  const router = useRouter();

  useEffect(() => {
    if (authorized) {
      sendMessage("random game");
    }
  }, [authorized]);

  on("gameId", (data) => {
    const { gameId } = data as { gameId: string };
    router.replace(`/chess/${gameId}`);
  });

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex gap-2">
        <Loader2 className="size-6 animate-spin" />
        <div>Searching for players online</div>
      </div>
    </div>
  );
};

export default Page;
