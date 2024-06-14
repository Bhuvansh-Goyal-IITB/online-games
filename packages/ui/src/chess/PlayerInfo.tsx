import { Color } from "@repo/chess";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/ui/avatar";
import { FC, useCallback } from "react";
import { useChessContext } from "../context/chessContext";

interface PlayerInfoProps {
  materialAdvantage: number;
  playerColor: Color;
  playerName?: string;
  avatarImageSrc?: string;
}

const PlayerInfo: FC<PlayerInfoProps> = ({
  materialAdvantage,
  playerColor,
}) => {
  const { getPlayerInfo } = useChessContext();

  const playerInfo = getPlayerInfo(playerColor);

  let playerName: string | undefined;
  let avatarImageSrc: string | undefined;

  if (playerInfo) {
    playerName = playerInfo.name;
    avatarImageSrc = playerInfo.profileImageSrc;
  }

  return (
    <div className="flex gap-3">
      <Avatar
        className={`rounded-md w-8 h-8 lg:w-12 lg:h-12 ${!avatarImageSrc ? "border p-1 bg-neutral-100 " : ""}`}
      >
        {avatarImageSrc ? (
          <AvatarImage
            className="rounded-md"
            src={avatarImageSrc}
            alt="profile pic"
          />
        ) : (
          <AvatarImage
            className="rounded-md"
            src="https://img.icons8.com/nolan/64/chess-com.png"
            alt="profile pic"
          />
        )}
        <AvatarFallback className="rounded-md">
          {playerColor.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex justify-start">
        <div className="flex gap-2">
          <span className="text-lg">
            {playerName ? playerName : playerColor == "w" ? "White" : "Black"}
          </span>
          {materialAdvantage > 0 && (
            <span className="text-md text-muted-foreground">
              +{materialAdvantage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
