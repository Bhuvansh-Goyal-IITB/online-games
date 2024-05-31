"use client";

import { Color, PieceType } from "@repo/chess";
import {
  Dispatch,
  HTMLAttributes,
  MouseEventHandler,
  SetStateAction,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PieceSet } from "./types";

function Piece({
  piece,
  pieceSet,
  validMoves,
  currentTurn,
  flip,
  dontAnimate,
  promotionMove,
  setSelectedPiece,
  setPromotionMove,
  move,
}: {
  piece: {
    id: string;
    pieceType: PieceType;
    color: Color;
    position: number;
  };
  currentTurn: Color;
  pieceSet: PieceSet;
  validMoves: number[];
  dontAnimate: boolean;
  flip: boolean;
  promotionMove: number[] | null;
  setPromotionMove: Dispatch<SetStateAction<number[] | null>>;
  setSelectedPiece: Dispatch<
    SetStateAction<{
      id: string;
      pieceType: PieceType;
      color: Color;
      position: number;
    } | null>
  >;
  move: (
    from: number,
    to: number,
    promoteTo?: Exclude<PieceType, "k" | "p">
  ) => void;
}) {
  const [held, setHeld] = useState(false);

  const { pieceType, color, position } = piece;

  const [pieceCoordinates, setPieceCoordinates] = useState({
    centerX: 0,
    centerY: 0,
    width: 0,
  });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [inPromotion, setInPromotion] = useState(false);

  const [animate, setAnimate] = useState(false);
  const [selfMove, setSelfMove] = useState(false);

  const [selectToggle, setSelectToggle] = useState(true);

  const graphicalPosition = flip ? 63 - position : position;
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    if (!divRef.current) return;

    const { left, right, top, bottom } =
      divRef.current!.getBoundingClientRect();

    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const width = Math.abs(left - right);

    setTranslate({
      x: event.clientX - centerX,
      y: event.clientY - centerY,
    });
    setPieceCoordinates({ centerX, centerY, width });
    setHeld(true);
    setAnimate(false);

    setSelectedPiece(piece);

    setSelectToggle((prev) => !prev);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!held) return;

    const { width } = pieceCoordinates;

    const mouseXDisplacement = event.clientX - pieceCoordinates.centerX;
    const mouseYDisplacement = event.clientY - pieceCoordinates.centerY;

    const xTranslate =
      event.clientX > pieceCoordinates.centerX
        ? Math.min(
            (7 - (graphicalPosition % 8)) * width + width / 2,
            mouseXDisplacement
          )
        : Math.max(
            -((graphicalPosition % 8) * width + width / 2),
            mouseXDisplacement
          );
    const yTranslate =
      event.clientY > pieceCoordinates.centerY
        ? Math.min(
            (7 - Math.floor(graphicalPosition / 8)) * width + width / 2,
            mouseYDisplacement
          )
        : Math.max(
            -(Math.floor(graphicalPosition / 8) * width + width / 2),
            mouseYDisplacement
          );

    setTranslate({
      x: xTranslate,
      y: yTranslate,
    });
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (!held) return;

    const { centerX, centerY, width } = pieceCoordinates;

    const col =
      (graphicalPosition % 8) +
      Math.ceil((event.clientX - centerX - width / 2) / width);

    const row =
      Math.floor(graphicalPosition / 8) +
      Math.ceil((event.clientY - centerY - width / 2) / width);

    const graphicalMouseUpPosition = row * 8 + col;
    const mouseUpPosition = flip
      ? 63 - graphicalMouseUpPosition
      : graphicalMouseUpPosition;

    if (0 <= row && row <= 7 && 0 <= col && col <= 7) {
      if (validMoves.includes(mouseUpPosition)) {
        if (
          pieceType == "p" &&
          ((color == "w" && mouseUpPosition <= 7) ||
            (color == "b" && mouseUpPosition >= 56))
        ) {
          setPromotionMove([position, mouseUpPosition]);
          setInPromotion(true);
          setTranslate({
            x:
              ((graphicalMouseUpPosition % 8) - (graphicalPosition % 8)) *
              pieceCoordinates.width,
            y:
              (Math.floor(graphicalMouseUpPosition / 8) -
                Math.floor(graphicalPosition / 8)) *
              pieceCoordinates.width,
          });

          setSelfMove(true);
          setSelectedPiece(null);

          setSelectToggle(true);
          setHeld(false);
          return;
        } else {
          move(position, mouseUpPosition);
          setSelfMove(true);
        }
      }
    }

    setTranslate({
      x: 0,
      y: 0,
    });
    setHeld(false);

    if (graphicalMouseUpPosition == graphicalPosition) {
      if (selectToggle) {
        setSelectedPiece(null);
      } else {
        setSelectToggle(true);
      }
    } else {
      setSelectedPiece(null);
      setSelectToggle(true);
    }
  };

  useEffect(() => {
    if (promotionMove == null && inPromotion) {
      setTranslate({
        x: 0,
        y: 0,
      });
      setInPromotion(false);
      setSelfMove(false);
    } else if (promotionMove && promotionMove[0] == position && !selfMove) {
      const graphicalToPosition = flip
        ? 63 - promotionMove[1]!
        : promotionMove[1]!;
      setTranslate({
        x:
          ((graphicalToPosition % 8) - (graphicalPosition % 8)) *
          pieceCoordinates.width,
        y:
          (Math.floor(graphicalToPosition / 8) -
            Math.floor(graphicalPosition / 8)) *
          pieceCoordinates.width,
      });
      setInPromotion(true);
    }
  }, [promotionMove]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [held, pieceCoordinates, flip]);

  useLayoutEffect(() => {
    setAnimate(false);
    if (inPromotion && promotionMove) {
      const graphicalToPosition = flip
        ? 63 - promotionMove[1]!
        : promotionMove[1]!;
      setTranslate({
        x:
          ((graphicalToPosition % 8) - (graphicalPosition % 8)) *
          pieceCoordinates.width,
        y:
          (Math.floor(graphicalToPosition / 8) -
            Math.floor(graphicalPosition / 8)) *
          pieceCoordinates.width,
      });
    }
  }, [flip]);

  useLayoutEffect(() => {
    if (selfMove || inPromotion) {
      setAnimate(false);
    } else {
      setAnimate(true);
    }
    setSelfMove(false);
  }, [position]);

  useEffect(() => {
    if (divRef.current) {
      const { left, right, top, bottom } =
        divRef.current.getBoundingClientRect();

      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;
      const width = Math.abs(left - right);

      setPieceCoordinates({
        centerX,
        centerY,
        width,
      });
    }
  }, []);

  const [previousValue, setPreviousValue] = useState(position);
  const [currentValue, setCurrentValue] = useState(position);

  useLayoutEffect(() => {
    setPreviousValue(currentValue);
    setCurrentValue(position);
  }, [position, currentTurn, dontAnimate]);

  const showPreviousPosition = flip ? 63 - previousValue : previousValue;
  const showPosition = flip ? 63 - position : position;

  const animationKeyFrames = `
      @keyframes tween-from-${showPreviousPosition}-to-${showPosition} {
        0% { transform: translate(${((showPreviousPosition % 8) - (showPosition % 8)) * 100}%, ${
          (Math.floor(showPreviousPosition / 8) -
            Math.floor(showPosition / 8)) *
          100
        }%); }
        100% { transform: translate(0%, 0%); }
      }
    `;

  return (
    <div
      ref={divRef}
      style={{
        left: `calc(${((graphicalPosition % 8) * 100) / 8}% + ${translate.x}px)`,
        top: `calc(${(Math.floor(graphicalPosition / 8) * 100) / 8}% + ${translate.y}px)`,
        animation: `tween-from-${showPreviousPosition}-to-${showPosition} 0.1s`,
      }}
      className={`absolute flex justify-center z-[1] items-center ${held ? "pointer-events-none" : ""} left-0 top-0 w-[12.5%] h-[12.5%] ${held || inPromotion ? "z-[2]" : ""}`}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={handleMouseDown}
    >
      {animate && !dontAnimate && previousValue != position && (
        <style>{animationKeyFrames}</style>
      )}
      <img
        className="w-[95%] h-[95%] pointer-events-none"
        src={`/${pieceSet}/${color}/${pieceType}.svg`}
        alt="chess piece"
      />
    </div>
  );
}

export default Piece;
