import { Color } from "@repo/chess";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/ui/avatar";
import { FC, useCallback } from "react";
import { useChessContext } from "../context/chessContext";

interface PlayerInfoProps {
  materialAdvantage: number;
  color: Color;
  name?: string;
  image?: string;
}

const PlayerInfo: FC<PlayerInfoProps> = ({ materialAdvantage, color }) => {
  const { getPlayerInfo } = useChessContext();

  const playerInfo = getPlayerInfo(color);

  let name: string | undefined;
  let image: string | undefined;

  if (playerInfo) {
    name = playerInfo.name;
    image = playerInfo.image;
  }

  return (
    <div className="flex gap-3">
      <Avatar
        className={`rounded-md w-8 h-8 lg:w-12 lg:h-12 ${!image ? "border p-1 bg-neutral-100 " : ""}`}
      >
        {image ? (
          <AvatarImage className="rounded-md" src={image} alt="profile pic" />
        ) : (
          <AvatarImage
            className="rounded-md"
            src="https://img.icons8.com/nolan/64/chess-com.png"
            alt="profile pic"
          />
        )}
        <AvatarFallback className="rounded-md">
          {color.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex justify-start">
        <div>
          <div className="flex gap-2 items-center">
            <span className="text-md md:text-lg">
              {name ? name : color == "w" ? "White" : "Black"}
            </span>
            {materialAdvantage > 0 && (
              <span className="text-md text-muted-foreground">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;
