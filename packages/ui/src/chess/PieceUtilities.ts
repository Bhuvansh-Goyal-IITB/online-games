import { useEffect, useState } from "react";
import { useChessContext } from "./chessContext";

export const generateAnimationKeyframes = (
  previousPosition: number,
  position: number
) => {
  return {
    animationName: `tween-from-${previousPosition}-to-${position}`,
    animationKeyframes: `

      @keyframes tween-from-${previousPosition}-to-${position} {
        0% { transform: translate(${((previousPosition % 8) - (position % 8)) * 100}%, ${
          (Math.floor(previousPosition / 8) - Math.floor(position / 8)) * 100
        }%); }
        100% { transform: translate(0%, 0%); }
      }
    `,
  };
};

export const usePreviousPosition = (position: number) => {
  const { currentTurn, preferences } = useChessContext();

  const [previousPosition, setPreviousPosition] = useState(position);
  const [currentPosition, setCurrentPosition] = useState(position);

  useEffect(() => {
    setPreviousPosition(currentPosition);
    setCurrentPosition(position);
  }, [position, currentTurn, preferences]);

  return previousPosition;
};

export const getPieceCoordinates = (div: HTMLDivElement) => {
  const { left, right, top, bottom } = div.getBoundingClientRect();

  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const width = Math.abs(left - right);
  return {
    centerX,
    centerY,
    width,
  };
};
