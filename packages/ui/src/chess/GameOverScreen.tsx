import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/components/ui/card";
import { FC, useEffect, useState } from "react";
import { useChessContext } from "../context/chessContext";

export const GameOverScreen: FC = () => {
  const { currentIndex, outcome } = useChessContext();
  const [gameOverScreenToggle, setGameOverScreenToggle] = useState(false);
  const [gameOverScreenShown, setGameOverScreenShown] = useState(false);

  useEffect(() => {
    if (outcome[0] != "" && !gameOverScreenShown) {
      setGameOverScreenToggle(true);
      setGameOverScreenShown(true);
    }

    if (gameOverScreenShown && outcome[0] == "") {
      setGameOverScreenShown(false);
      setGameOverScreenToggle(false);
    }
  }, [outcome]);

  useEffect(() => {
    if (gameOverScreenShown && gameOverScreenToggle) {
      setGameOverScreenToggle(false);
    }
  }, [currentIndex]);

  if (gameOverScreenToggle) {
    return (
      <div
        className="absolute flex justify-center items-center top-0 left-0 w-full h-full z-[5] bg-black bg-opacity-50"
        onClick={() => setGameOverScreenToggle(false)}
      >
        <Card>
          <CardHeader className="p-8">
            <CardTitle>
              <div className="flex justify-center text-3xl">
                {outcome[0] == "w"
                  ? "White Won"
                  : outcome[0] == "b"
                    ? "Black Won"
                    : "Draw"}
              </div>
            </CardTitle>
            <CardDescription>
              {outcome[1] == "abandon" ? (
                <div className="flex justify-center text-lg">
                  game abandoned
                </div>
              ) : (
                <div className="flex justify-center text-lg">
                  by {outcome[1]}
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  } else {
    return <></>;
  }
};
