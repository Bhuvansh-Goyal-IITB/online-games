import { Button } from "@ui/components/ui/button";
import React, { FC } from "react";
import { useChessContext } from "./chessContext";

const MoveList: FC = () => {
  const { moveList, currentIndex, goToMove } = useChessContext();
  return (
    <div className="grid grid-cols-7 w-full h-full gap-2">
      {moveList.map((move, index) =>
        index % 2 == 0 ? (
          <React.Fragment key={`${move}-${index}`}>
            <span className="flex items-center">{index / 2 + 1}.</span>
            <div className="col-span-3">
              {currentIndex - 1 == index ? (
                <Button onClick={() => goToMove(index)}>{move}</Button>
              ) : (
                <Button variant="ghost" onClick={() => goToMove(index)}>
                  {move}
                </Button>
              )}
            </div>
          </React.Fragment>
        ) : (
          <div key={`${move}-${index}`} className="col-span-3">
            {currentIndex - 1 == index ? (
              <Button onClick={() => goToMove(index)}>{move}</Button>
            ) : (
              <Button variant="ghost" onClick={() => goToMove(index)}>
                {move}
              </Button>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default MoveList;
