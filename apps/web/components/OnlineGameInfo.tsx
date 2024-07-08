import { useChessContext } from "@repo/ui/context/chessContext";
import PlayerInfo from "@ui/chess/PlayerInfo";
import { FC, PropsWithChildren } from "react";
import { OnlineGameClock } from "./OnlineGameClock";

interface OnlineGameInfoProps extends PropsWithChildren {
  timeData: { w: number; b: number };
  abortData: { leftPlayer: "w" | "b"; time: number } | null;
}

export const OnlineGameInfo: FC<OnlineGameInfoProps> = ({
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
          <OnlineGameClock
            timeData={timeData}
            abortData={abortData}
            color="b"
          />
        </div>
      ) : (
        <div className="w-full flex justify-between">
          <PlayerInfo materialAdvantage={-materialAdvantage} color="w" />
          <OnlineGameClock
            timeData={timeData}
            abortData={abortData}
            color="w"
          />
        </div>
      )}
      {children}
      {!flip ? (
        <div className="w-full flex justify-between">
          <PlayerInfo materialAdvantage={-materialAdvantage} color="w" />
          <OnlineGameClock
            timeData={timeData}
            abortData={abortData}
            color="w"
          />
        </div>
      ) : (
        <div className="w-full flex justify-between">
          <PlayerInfo materialAdvantage={-materialAdvantage} color="b" />
          <OnlineGameClock
            timeData={timeData}
            abortData={abortData}
            color="b"
          />
        </div>
      )}
    </div>
  );
};
