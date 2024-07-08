import { Clock } from "@repo/ui/chess/Clock";
import { FC } from "react";

interface OnlineGameClockProps {
  color: "w" | "b";
  timeData: { w: number; b: number };
  abortData: { leftPlayer: "w" | "b"; time: number } | null;
}

export const OnlineGameClock: FC<OnlineGameClockProps> = ({
  color,
  timeData,
  abortData,
}) => {
  return (
    <div className="flex gap-2">
      {abortData && abortData.leftPlayer == color && (
        <Clock time={abortData.time} title="Game will abort in" />
      )}
      <Clock time={timeData[color]} />
    </div>
  );
};
