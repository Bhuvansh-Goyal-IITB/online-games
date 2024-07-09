"use client";

import { useChessContext } from "@repo/ui/context/chessContext";
import PlayerInfo from "@ui/chess/PlayerInfo";
import { FC, PropsWithChildren } from "react";
import { AbortClock } from "./AbortClock";
import { GameClock } from "./GameClock";

interface GameInfoProps extends PropsWithChildren {
  timeData: { w: number; b: number };
  abortData: { leftPlayer: "w" | "b"; time: number } | null;
}

export const GameInfo: FC<GameInfoProps> = ({
  children,
  timeData,
  abortData,
}) => {
  const {
    preferences: { flip },
    pieceList,
  } = useChessContext();

  let materialAdvantage = 0;

  pieceList.forEach((piece) => {
    const multiplier = piece.color == "w" ? 1 : -1;

    switch (piece.pieceType) {
      case "p":
        materialAdvantage += multiplier;
        break;

      case "r":
        materialAdvantage += multiplier * 5;
        break;

      case "n":
        materialAdvantage += multiplier * 3;
        break;

      case "b":
        materialAdvantage += multiplier * 3;
        break;

      case "q":
        materialAdvantage += multiplier * 9;
        break;

      case "k":
        break;

      default:
        break;
    }
  });

  return (
    <div className="flex flex-col gap-4">
      {!flip ? (
        <div className="w-full flex justify-between">
          <PlayerInfo materialAdvantage={-materialAdvantage} color="b" />
          <div className="flex gap-2">
            {abortData && abortData.leftPlayer == "b" && (
              <AbortClock time={abortData.time} />
            )}
            <GameClock time={timeData.b} />
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-between">
          <PlayerInfo materialAdvantage={-materialAdvantage} color="w" />
          <div className="flex gap-2">
            {abortData && abortData.leftPlayer == "w" && (
              <AbortClock time={abortData.time} />
            )}
            <GameClock time={timeData.w} />
          </div>
        </div>
      )}
      {children}
      {!flip ? (
        <div className="w-full flex justify-between">
          <PlayerInfo materialAdvantage={-materialAdvantage} color="w" />
          <div className="flex gap-2">
            {abortData && abortData.leftPlayer == "w" && (
              <AbortClock time={abortData.time} />
            )}
            <GameClock time={timeData.w} />
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-between">
          <PlayerInfo materialAdvantage={-materialAdvantage} color="b" />
          <div className="flex gap-2">
            {abortData && abortData.leftPlayer == "b" && (
              <AbortClock time={abortData.time} />
            )}
            <GameClock time={timeData.b} />
          </div>
        </div>
      )}
    </div>
  );
};
