"use client";

import { Chess, Color, PieceType } from "@repo/chess";
import {
  FC,
  MouseEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  return {
    name: `tween-from-${previousPosition}-to-${position}`,
    keyframes: `

      @keyframes tween-from-${previousPosition}-to-${position} {
        0% { transform: translate(${((previousPosition % 8) - (position % 8)) * 100}%, ${
          (Math.floor(previousPosition / 8) - Math.floor(position / 8)) * 100
        }%); }
        100% { transform: translate(0%, 0%); }
      }
    `,
  };
};

const usePreviousPosition = (position: number, currentTurn: Color) => {
  const [previousPosition, setPreviousPosition] = useState(position);
  const [currentPosition, setCurrentPosition] = useState(position);
  useEffect(() => {
    setPreviousPosition(currentPosition);
    setCurrentPosition(position);
  }, [position, currentTurn]);

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
  const { currentTurn, promotionMove, movePiece, setPromotionMove } =
    useChessContext();

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [promotionTranslate, setPromotionTranslate] = useState({ x: 0, y: 0 });
  const [held, setHeld] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const [selfMove, setSelfMove] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [promotionAnimate, setPromotionAnimate] = useState(false);
  const previousPosition = usePreviousPosition(position, currentTurn);
  const [promotionPosition, setPromotionPosition] = useState<number | null>(
    null
  );
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
          setPromotionAnimate(false);
          setPromotionPosition(mouseUpPosition);
          setSelfMove(true);
          setPromotionTranslate({
            x: ((mouseUpPosition % 8) - (position % 8)) * width,
            y:
              (Math.floor(mouseUpPosition / 8) - Math.floor(position / 8)) *
              width,
          });
          setPromotionMove([position, mouseUpPosition]);
        } else {
          setSelfMove(true);
          movePiece(
            `${Chess.position_to_algebraic(position)}${Chess.position_to_algebraic(mouseUpPosition)}`
          );
        }
      }
    } else {
    }

    setHeld(false);
    setTranslate({
      x: 0,
      y: 0,
    });
  };

  useLayoutEffect(() => {
    if (promotionMove && promotionMove[0] == position && !selfMove) {
      const { width } = pieceCoordinates;

      setPromotionAnimate(true);
      setPromotionPosition(promotionMove[1]!);
      setPromotionTranslate({
        x: ((promotionMove[1]! % 8) - (position % 8)) * width,
        y:
          (Math.floor(promotionMove[1]! / 8) - Math.floor(position / 8)) *
          width,
      });
    } else if (promotionMove == null && promotionPosition != null) {
      if (position != promotionPosition) {
        setPromotionAnimate(true);
      }
      setPromotionPosition(null);
      setPromotionTranslate({
        x: 0,
        y: 0,
      });
    }
  }, [promotionMove]);

  useLayoutEffect(() => {
    if (selfMove) {
      setAnimate(false);
    } else {
      setAnimate(true);
    }

    setSelfMove(false);
  }, [position]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [held, pieceCoordinates]);

  let animationName = "";
  let animationKeyframes = "";

  if (animate) {
    const { name, keyframes } = generateAnimationKeyframes(
      previousPosition,
      position
    );
    animationName = name;
    animationKeyframes = keyframes;
  }

  return (
    <div
      ref={divRef}
      style={{
        transform: `translate(${promotionTranslate.x}px, ${promotionTranslate.y}px) ${held ? "scale(1.1)" : ""}`,
        left: `calc(${((position % 8) * 100) / 8}% + ${translate.x}px) `,
        top: `calc(${(Math.floor(position / 8) * 100) / 8}% + ${translate.y}px)`,
        animation: `${animationName} 0.2s`,
      }}
      className={`absolute flex justify-center items-center w-[12.5%] h-[12.5%] ${held ? "z-[2] grow-animation" : ""} ${animate ? "z-[1]" : ""} ${promotionAnimate ? "translate-animation" : ""}`}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={handleMouseDown}
    >
      <style>{animationKeyframes}</style>
      <img src={`/cardinal/${color}/${pieceType}.svg`} />
    </div>
  );
};
