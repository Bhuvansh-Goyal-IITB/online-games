import { Card, CardHeader } from "@ui/components/ui/card";
import { FC } from "react";

interface GameClockProps {
  time: number;
}

export const GameClock: FC<GameClockProps> = ({ time }) => {
  return (
    <Card className="flex justify-center items-center">
      <CardHeader className="text-lg md:text-xl p-2 py-1 md:px-4">
        {Math.floor(time / 60)} : {(time % 60).toString().padStart(2, "0")}
      </CardHeader>
    </Card>
  );
};
