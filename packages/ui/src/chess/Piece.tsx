"use client";

import { Chess, Color, PieceType } from "@repo/chess";
import { FC, MouseEventHandler, useEffect, useRef, useState } from "react";
import { useChessContext } from "./chessContext";

interface PieceProps {
  position: number;
  color: Color;
  pieceType: PieceType;
  validMoves: number[];
}

const generateAnimationKeyframes = (
  previousPosition: number,
  position: number
) => {
  return `
      @keyframes tween-from-${previousPosition}-to-${position} {
        0% { transform: translate(${((previousPosition % 8) - (position % 8)) * 100}%, ${
          (Math.floor(previousPosition / 8) - Math.floor(position / 8)) * 100
        }%); }
        100% { transform: translate(0%, 0%); }
      }
    `;
};

const usePreviousPosition = (position: number) => {
  const [previousPosition, setPreviousPosition] = useState(position);
  const [currentPosition, setCurrentPosition] = useState(position);
  useEffect(() => {
    setPreviousPosition(currentPosition);
    setCurrentPosition(position);
  }, [position]);

  return previousPosition;
};

const getPieceCoordinates = (div: HTMLDivElement) => {
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

export const Piece: FC<PieceProps> = ({
  position,
  color,
  pieceType,
  validMoves,
}) => {
  const { movePiece } = useChessContext();

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [animationKeyframes, setAnimationKeyframes] = useState("");
  const [held, setHeld] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const previousPosition = usePreviousPosition(position);
  const [pieceCoordinates, setPieceCoordinates] = useState({
    centerX: 0,
    centerY: 0,
    width: 0,
  });

  const handleMouseDown: MouseEventHandler = (event) => {
    if (!divRef.current) return;

    const { centerX, centerY } = getPieceCoordinates(divRef.current);
    setTranslate({
      x: event.clientX - centerX,
      y: event.clientY - centerY,
    });
    setHeld(true);
    setPieceCoordinates(getPieceCoordinates(divRef.current));
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (held) {
      const { centerX, centerY, width } = pieceCoordinates;

      const minX = -width / 2 - (position % 8) * width;
      const maxX = width / 2 + (7 - (position % 8)) * width;

      const minY = -width / 2 - Math.floor(position / 8) * width;
      const maxY = width / 2 + (7 - Math.floor(position / 8)) * width;

      setTranslate({
        x: Math.min(maxX, Math.max(event.clientX - centerX, minX)),
        y: Math.min(maxY, Math.max(event.clientY - centerY, minY)),
      });
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (!held) return;
    const { centerX, centerY, width } = pieceCoordinates;

    const xDisplacement = Math.ceil(
      (event.clientX - centerX - width / 2) / width
    );
    const yDisplacement = Math.ceil(
      (event.clientY - centerY - width / 2) / width
    );

    const col = (position % 8) + xDisplacement;
    const row = Math.floor(position / 8) + yDisplacement;

    const mouseUpPosition = row * 8 + col;

    if (0 <= row && row <= 7 && 0 <= col && col <= 7) {
      if (validMoves.includes(mouseUpPosition)) {
        if (
          pieceType == "p" &&
          ((color == "w" && mouseUpPosition <= 7) ||
            (color == "b" && mouseUpPosition >= 56))
        ) {
          movePiece(
            `${Chess.position_to_algebraic(position)}${Chess.position_to_algebraic(mouseUpPosition)}q`
          );
        } else {
          movePiece(
            `${Chess.position_to_algebraic(position)}${Chess.position_to_algebraic(mouseUpPosition)}`
          );
        }
      }
    }

    setHeld(false);
    setTranslate({
      x: 0,
      y: 0,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [held, pieceCoordinates]);

  useEffect(() => {});

  return (
    <div
      ref={divRef}
      style={{
        transform: `translate(${translate.x}px, ${translate.y}px)`,
        left: `${((position % 8) * 100) / 8}%`,
        top: `${(Math.floor(position / 8) * 100) / 8}%`,
      }}
      className="absolute flex justify-center items-center w-[12.5%] h-[12.5%]"
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={handleMouseDown}
    >
      <img src={`/cardinal/${color}/${pieceType}.svg`} />
    </div>
  );
};
