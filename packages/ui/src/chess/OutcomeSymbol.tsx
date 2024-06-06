import { Color, PieceType } from "@repo/chess";
import { FC, PropsWithChildren } from "react";
import { useChessContext } from "./chessContext";

interface OutcomeSymbolProps {
  pieceType: PieceType;
  color: Color;
  position: number;
}

// const ContainerDiv: FC<PropsWithChildren> = () => {

// }

export const OutcomeSymbol: FC<OutcomeSymbolProps> = ({
  pieceType,
  color,
  position,
}) => {
  const { currentIndex, moveList, outcome } = useChessContext();
  return (
    <>
      {pieceType == "k" &&
        currentIndex == moveList.length &&
        (outcome[0] == "w" ? (
          color == "w" ? (
            <div
              className={`absolute ${position % 8 != 7 ? "-right-4" : "right-1"} ${Math.floor(position / 8) != 0 ? "-top-4" : "top-1"} w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10`}
            >
              <img className="w-full h-full" src="/crown.svg" />
            </div>
          ) : (
            <div
              className={`absolute ${position % 8 != 7 ? "-right-4" : "right-1"} ${Math.floor(position / 8) != 0 ? "-top-4" : "top-1"} w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10`}
            >
              <img src="/black-mate.svg" />
            </div>
          )
        ) : outcome[0] == "b" ? (
          color == "w" ? (
            <div
              className={`absolute ${position % 8 != 7 ? "-right-4" : "right-1"} ${Math.floor(position / 8) != 0 ? "-top-4" : "top-1"} w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10`}
            >
              <img src="/white-mate.svg" />
            </div>
          ) : (
            <div
              className={`absolute ${position % 8 != 7 ? "-right-4" : "right-1"} ${Math.floor(position / 8) != 0 ? "-top-4" : "top-1"} w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10`}
            >
              <img src="/crown.svg" />
            </div>
          )
        ) : outcome[0] == "d" ? (
          color == "w" ? (
            <div
              className={`absolute ${position % 8 != 7 ? "-right-4" : "right-1"} ${Math.floor(position / 8) != 0 ? "-top-4" : "top-1"} w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10`}
            >
              <img src="/draw-white.svg" />
            </div>
          ) : (
            <div
              className={`absolute ${position % 8 != 7 ? "-right-4" : "right-1"} ${Math.floor(position / 8) != 0 ? "-top-4" : "top-1"} w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10`}
            >
              <img src="/draw-black.svg" />
            </div>
          )
        ) : (
          <></>
        ))}
    </>
  );
};
