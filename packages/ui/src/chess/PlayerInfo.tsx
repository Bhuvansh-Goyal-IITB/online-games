import { Color } from "@repo/chess";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/ui/avatar";
import { FC } from "react";

interface PlayerInfoProps {
  materialAdvantage: number;
  playerColor: Color;
  playerName?: string;
  avatarImageSrc?: string;
}

const PlayerInfo: FC<PlayerInfoProps> = ({
  materialAdvantage,
  playerColor,
  playerName,
  avatarImageSrc,
}) => {
  return (
    <div className="flex gap-3">
      <Avatar className="rounded-md w-12 h-12">
        {avatarImageSrc ? (
          <AvatarImage
            className="rounded-md"
            src={avatarImageSrc}
            alt="profile pic"
          />
        ) : (
          <AvatarImage
            className="rounded-md bg-muted-foreground"
            src={playerColor == "w" ? "/cardinal/w/p.svg" : "/cardinal/b/p.svg"}
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
