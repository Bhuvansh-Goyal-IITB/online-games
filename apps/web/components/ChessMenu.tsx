"use client";

import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import React, { FC, useState } from "react";
import { toast } from "@repo/ui/components/ui/sonner";
import Link from "next/link";

const ChessMenu: FC = () => {
  const [pending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCreateGame = async () => {
    setIsPending(true);

    try {
      const { gameId } = (await fetch("/api/create-game/chess").then((res) =>
        res.json(),
      )) as { gameId: string };

      router.push(`/chess/${gameId}`);
    } catch (error) {
      toast.error("Something went wrong");
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <Button disabled={pending} onClick={handleCreateGame} size="lg">
        Create Game
      </Button>
      <Button size="lg" asChild>
        <Link href="/chess/random" replace={true}>
          Play Online
        </Link>
      </Button>
    </div>
  );
};

export default ChessMenu;
