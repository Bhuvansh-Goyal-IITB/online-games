"use client";

import { Chess, Color, PieceType } from "@repo/chess";
import {
  FC,
  MouseEventHandler,
  TouchEventHandler,
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

const usePreviousPosition = (position: number) => {
  const { currentTurn, preferences } = useChessContext();

  const [previousPosition, setPreviousPosition] = useState(position);
  const [currentPosition, setCurrentPosition] = useState(position);

  useEffect(() => {
    setPreviousPosition(currentPosition);
    setCurrentPosition(position);
  }, [position, currentTurn, preferences]);

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
  const {
    promotionMove,
    canAnimate,
    preferences: { pieceSet, flip },
    movePiece,
    setSelectedPiece,
    setPromotionMove,
  } = useChessContext();

  const [promotionTranslate, setPromotionTranslate] = useState({ x: 0, y: 0 });
  const [held, setHeld] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);

  const [selfMove, setSelfMove] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [promotionAnimate, setPromotionAnimate] = useState(false);
  const previousPosition = usePreviousPosition(position);
  const [promotionPosition, setPromotionPosition] = useState<number | null>(
    null
  );
  const [pieceCoordinates, setPieceCoordinates] = useState({
    centerX: 0,
    centerY: 0,
    width: 0,
  });

  const displayPreviousPosition = flip
    ? 63 - previousPosition
    : previousPosition;
  const displayPosition = flip ? 63 - position : position;

  const handleMouseDown: MouseEventHandler = (event) => {
    if (!divRef.current) return;

    const { centerX, centerY, width } = getPieceCoordinates(divRef.current);
    const translate = {
      x: event.clientX - centerX,
      y: event.clientY - centerY,
    };

    divRef.current.style.left = `calc(${((displayPosition % 8) * 100) / 8}% + ${translate.x}px)`;
    divRef.current.style.top = `calc(${(Math.floor(displayPosition / 8) * 100) / 8}% + ${translate.y}px)`;
    setHeld(true);
    setSelectedPiece({
      pieceType,
      color,
      position,
    });
    setPieceCoordinates({ centerX, centerY, width });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!held || !divRef.current) return;
    const { centerX, centerY, width } = pieceCoordinates;

    const minX = -width / 2 - (displayPosition % 8) * width;
    const maxX = width / 2 + (7 - (displayPosition % 8)) * width;

    const minY = -width / 2 - Math.floor(displayPosition / 8) * width;
    const maxY = width / 2 + (7 - Math.floor(displayPosition / 8)) * width;

    const translate = {
      x: Math.min(maxX, Math.max(event.clientX - centerX, minX)),
      y: Math.min(maxY, Math.max(event.clientY - centerY, minY)),
    };
    divRef.current.style.left = `calc(${((displayPosition % 8) * 100) / 8}% + ${translate.x}px)`;
    divRef.current.style.top = `calc(${(Math.floor(displayPosition / 8) * 100) / 8}% + ${translate.y}px)`;
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (!held || !divRef.current) return;
    const { centerX, centerY, width } = pieceCoordinates;

    const xDisplacement = Math.ceil(
      (event.clientX - centerX - width / 2) / width
    );
    const yDisplacement = Math.ceil(
      (event.clientY - centerY - width / 2) / width
    );

    const col = (displayPosition % 8) + xDisplacement;
    const row = Math.floor(displayPosition / 8) + yDisplacement;

    const displayMouseUpPosition = row * 8 + col;
    const mouseUpPosition = flip
      ? 63 - displayMouseUpPosition
      : displayMouseUpPosition;

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
            x: ((displayMouseUpPosition % 8) - (displayPosition % 8)) * width,
            y:
              (Math.floor(displayMouseUpPosition / 8) -
                Math.floor(displayPosition / 8)) *
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
    }

    setHeld(false);
    divRef.current.style.left = `${((displayPosition % 8) * 100) / 8}%`;
    divRef.current.style.top = `${(Math.floor(displayPosition / 8) * 100) / 8}% `;

    if (mouseUpPosition != position) {
      setSelectedPiece(null);
    }
  };

  const handleTouchStart: TouchEventHandler = (event) => {
    if (!divRef.current || event.touches.length == 0) return;

    const { centerX, centerY, width } = getPieceCoordinates(divRef.current);
    const touchX = event.touches[0]!.clientX;
    const touchY = event.touches[0]!.clientY;

    const translate = {
      x: touchX - centerX,
      y: touchY - centerY,
    };

    divRef.current.style.left = `calc(${((displayPosition % 8) * 100) / 8}% + ${translate.x}px)`;
    divRef.current.style.top = `calc(${(Math.floor(displayPosition / 8) * 100) / 8}% + ${translate.y}px)`;
    setHeld(true);
    setSelectedPiece({
      pieceType,
      color,
      position,
    });
    setPieceCoordinates({ centerX, centerY, width });
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!held || !divRef.current || event.touches.length == 0) return;

    const { centerX, centerY, width } = pieceCoordinates;

    const touchX = event.touches[0]!.clientX;
    const touchY = event.touches[0]!.clientY;

    const minX = -width / 2 - (displayPosition % 8) * width;
    const maxX = width / 2 + (7 - (displayPosition % 8)) * width;

    const minY = -width / 2 - Math.floor(displayPosition / 8) * width;
    const maxY = width / 2 + (7 - Math.floor(displayPosition / 8)) * width;

    const translate = {
      x: Math.min(maxX, Math.max(touchX - centerX, minX)),
      y: Math.min(maxY, Math.max(touchY - centerY, minY)),
    };
    divRef.current.style.left = `calc(${((displayPosition % 8) * 100) / 8}% + ${translate.x}px)`;
    divRef.current.style.top = `calc(${(Math.floor(displayPosition / 8) * 100) / 8}% + ${translate.y}px)`;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (!held || !divRef.current || event.changedTouches.length == 0) return;
    const { centerX, centerY, width } = pieceCoordinates;
    const touchX = event.changedTouches[0]!.clientX;
    const touchY = event.changedTouches[0]!.clientY;

    const xDisplacement = Math.ceil((touchX - centerX - width / 2) / width);
    const yDisplacement = Math.ceil((touchY - centerY - width / 2) / width);

    const col = (displayPosition % 8) + xDisplacement;
    const row = Math.floor(displayPosition / 8) + yDisplacement;

    const displayTouchUpPosition = row * 8 + col;
    const touchUpPosition = flip
      ? 63 - displayTouchUpPosition
      : displayTouchUpPosition;

    if (0 <= row && row <= 7 && 0 <= col && col <= 7) {
      if (validMoves.includes(touchUpPosition)) {
        if (
          pieceType == "p" &&
          ((color == "w" && touchUpPosition <= 7) ||
            (color == "b" && touchUpPosition >= 56))
        ) {
          setPromotionAnimate(false);
          setPromotionPosition(touchUpPosition);
          setSelfMove(true);
          setPromotionTranslate({
            x: ((displayTouchUpPosition % 8) - (displayPosition % 8)) * width,
            y:
              (Math.floor(displayTouchUpPosition / 8) -
                Math.floor(displayPosition / 8)) *
              width,
          });
          setPromotionMove([position, touchUpPosition]);
        } else {
          setSelfMove(true);
          movePiece(
            `${Chess.position_to_algebraic(position)}${Chess.position_to_algebraic(touchUpPosition)}`
          );
        }
      }
    }

    setHeld(false);
    divRef.current.style.left = `${((displayPosition % 8) * 100) / 8}%`;
    divRef.current.style.top = `${(Math.floor(displayPosition / 8) * 100) / 8}% `;

    if (touchUpPosition != position) {
      setSelectedPiece(null);
    }
  };

  useLayoutEffect(() => {
    if (promotionMove && promotionMove[0] == position && !selfMove) {
      const { width } = pieceCoordinates;
      const displayToPosition = flip
        ? 63 - promotionMove[1]!
        : promotionMove[1]!;

      setPromotionAnimate(true);
      setPromotionPosition(promotionMove[1]!);
      setPromotionTranslate({
        x: ((displayToPosition % 8) - (displayPosition % 8)) * width,
        y:
          (Math.floor(displayToPosition / 8) -
            Math.floor(displayPosition / 8)) *
          width,
      });
    } else if (promotionMove == null && promotionPosition != null) {
      if (position != promotionPosition) {
        setPromotionAnimate(true);
      } else {
        setPromotionAnimate(false);
      }
      setSelfMove(false);
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
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [held, pieceCoordinates]);

  useLayoutEffect(() => {
    setAnimate(false);

    if (promotionMove && promotionMove[0] == position) {
      const { width } = pieceCoordinates;
      const displayToPosition = flip
        ? 63 - promotionMove[1]!
        : promotionMove[1]!;

      setPromotionTranslate({
        x: ((displayToPosition % 8) - (displayPosition % 8)) * width,
        y:
          (Math.floor(displayToPosition / 8) -
            Math.floor(displayPosition / 8)) *
          width,
      });
    }
  }, [flip]);

  const { animationName, animationKeyframes } = generateAnimationKeyframes(
    displayPreviousPosition,
    displayPosition
  );

  return (
    <div
      ref={divRef}
      style={{
        transform: `translate(${promotionTranslate.x}px, ${promotionTranslate.y}px) ${held ? "scale(1.1)" : ""}`,
        left: `${((displayPosition % 8) * 100) / 8}%`,
        top: `${(Math.floor(displayPosition / 8) * 100) / 8}%`,
        animation: `${animationName} 0.2s`,
      }}
      className={`absolute flex justify-center items-center w-[12.5%] h-[12.5%] z-[1] ${held ? "z-[2] grow-animation" : ""} ${promotionAnimate && canAnimate ? "translate-animation z-[2]" : ""}`}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {animate && canAnimate && <style>{animationKeyframes}</style>}
      <img src={`/${pieceSet}/${color}/${pieceType}.svg`} />
    </div>
  );
};
