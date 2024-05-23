import { Move, PieceInfo, PieceType } from "@repo/chess";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { PieceSet } from "./types";

function usePreviousPosition(piece: PieceInfo) {
  const [previousValue, setPreviousValue] = useState(piece.position);
  const [valueBuffer, setValueBuffer] = useState<number | null>(null);
  const [counter, setCounter] = useState<number>(0);

  useLayoutEffect(() => {
    if (valueBuffer == null) {
      if (counter == 1) {
        setValueBuffer(piece.position);
      }
    } else {
      setPreviousValue(valueBuffer);
      setValueBuffer(piece.position);
    }

    if (counter == 2) {
      setCounter(0);
    } else {
      setCounter(counter + 1);
    }
  }, [piece]);

  return previousValue;
}

interface PieceProps {
  pieceSet: PieceSet;
  piece: PieceInfo;
  promotePosition: number | null;
  validMoves: Move[];
  flip: boolean;
  animate: boolean;
  setHoverPosition: Dispatch<SetStateAction<number | null>>;
  setSelectedPiece: Dispatch<SetStateAction<PieceInfo | null>>;
  setAnimatedPiecePositions: Dispatch<SetStateAction<number[] | null>>;
  setPromotionMove: Dispatch<SetStateAction<Move | null>>;
  movePiece: (move: Move, promoteTo?: Exclude<PieceType, "k" | "p">) => void;
}
export default function Piece({
  pieceSet,
  piece,
  promotePosition,
  validMoves,
  flip,
  animate,
  setHoverPosition,
  setSelectedPiece,
  setAnimatedPiecePositions,
  setPromotionMove,
  movePiece,
}: PieceProps) {
  const [isHeld, setIsHeld] = useState(false);
  const previousPosition = usePreviousPosition(piece);
  const [pieceCoordinates, setPieceCoordinates] = useState({
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    centerX: 0,
    centerY: 0,
  });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isSelected, setIsSelected] = useState(false);
  const [promotionMenuOpen, setPromotionMenuOpen] = useState(false);

  const showPosition = flip ? 63 - piece.position : piece.position;
  const showPreviousPosition = flip ? 63 - previousPosition : previousPosition;

  const getMousePosition = (mouseX: number, mouseY: number) => {
    let pieceWidth = Math.abs(pieceCoordinates.right - pieceCoordinates.left);

    let col =
      (showPosition % 8) +
      Math.ceil(
        (mouseX - pieceCoordinates.centerX - pieceWidth / 2) / pieceWidth
      );

    let row =
      Math.floor(showPosition / 8) +
      Math.ceil(
        (mouseY - pieceCoordinates.centerY - pieceWidth / 2) / pieceWidth
      );

    return {
      row,
      col,
    };
  };

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    const { left, right, top, bottom } =
      event.currentTarget.getBoundingClientRect();

    setPieceCoordinates({
      left,
      right,
      top,
      bottom,
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
    });

    setIsHeld(true);
    setIsSelected((prev) => !prev);
    setHoverPosition(piece.position);
    setSelectedPiece(piece);

    setTranslate({
      x: event.clientX - (left + right) / 2,
      y: event.clientY - (top + bottom) / 2,
    });
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (isHeld) {
      setIsHeld(false);
      setHoverPosition(null);

      const { row, col } = getMousePosition(event.clientX, event.clientY);
      const mouseUpPosition = flip ? 63 - (8 * row + col) : 8 * row + col;

      if (0 <= row && row <= 7 && 0 <= col && col <= 7) {
        const move = validMoves.find((move) => move.to == mouseUpPosition);
        if (move) {
          if (move.isPromoting) {
            setPromotionMenuOpen(true);
            setPromotionMove(move);
            setSelectedPiece(null);

            setTranslate({
              x:
                (col - (showPosition % 8)) *
                (pieceCoordinates.right - pieceCoordinates.left),
              y:
                (row - Math.floor(showPosition / 8)) *
                (pieceCoordinates.right - pieceCoordinates.left),
            });

            return;
          } else {
            movePiece(move);
          }

          if (move.isCastling) {
            move.from > move.to
              ? setAnimatedPiecePositions([move.to + 1])
              : setAnimatedPiecePositions([move.to - 1]);
          } else {
            setAnimatedPiecePositions(null);
          }
          setSelectedPiece(null);
        }
      }

      setTranslate({
        x: 0,
        y: 0,
      });
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isHeld) {
      const { row, col } = getMousePosition(event.clientX, event.clientY);
      const pieceWidth = pieceCoordinates.right - pieceCoordinates.left;

      const mousePosition = flip ? 63 - (8 * row + col) : 8 * row + col;

      const showPosition = flip ? 63 - piece.position : piece.position;

      if (0 <= row && row <= 7 && 0 <= col && col <= 7) {
        setHoverPosition(mousePosition);
      } else {
        setHoverPosition(null);
      }

      const mouseXDisplacement = event.clientX - pieceCoordinates.centerX;
      const mouseYDisplacement = event.clientY - pieceCoordinates.centerY;

      const xTranslate =
        event.clientX > pieceCoordinates.centerX
          ? Math.min(
              (7 - (showPosition % 8)) * pieceWidth + pieceWidth / 2,
              mouseXDisplacement
            )
          : Math.max(
              -((showPosition % 8) * pieceWidth + pieceWidth / 2),
              mouseXDisplacement
            );
      const yTranslate =
        event.clientY > pieceCoordinates.centerY
          ? Math.min(
              (7 - Math.floor(showPosition / 8)) * pieceWidth + pieceWidth / 2,
              mouseYDisplacement
            )
          : Math.max(
              -(Math.floor(showPosition / 8) * pieceWidth + pieceWidth / 2),
              mouseYDisplacement
            );

      setTranslate({
        x: xTranslate,
        y: yTranslate,
      });
    }
  };

  const handlePromotionClick = (promoteTo: Exclude<PieceType, "k" | "p">) => {
    const pieceWidth = pieceCoordinates.right - pieceCoordinates.left;

    const row = Math.floor(showPosition / 8) + translate.y / pieceWidth;
    const col = (showPosition % 8) + translate.x / pieceWidth;

    const to = flip ? 63 - (8 * row + col) : 8 * row + col;

    const move = validMoves.find((move) => move.to == to)!;

    movePiece(move, promoteTo);

    setPromotionMenuOpen(false);
    setAnimatedPiecePositions(null);
    setPromotionMove(null);
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
  }, [isHeld, pieceCoordinates, flip]);

  useEffect(() => {
    if (promotePosition != null) {
      const pieceWidth = pieceCoordinates.right - pieceCoordinates.left;
      const translateX =
        ((promotePosition % 8) - (piece.position % 8)) * pieceWidth;
      const translateY =
        (Math.floor(promotePosition / 8) - Math.floor(piece.position / 8)) *
        pieceWidth;

      setTranslate({
        x: flip ? -translateX : translateX,
        y: flip ? -translateY : translateY,
      });
      setPromotionMenuOpen(true);
      setSelectedPiece(null);
    }
  }, [promotePosition, flip]);

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
    <>
      {promotionMenuOpen && (
        <div
          className="absolute left-0 top-0 w-full h-full z-50"
          onClick={() => {
            setPromotionMenuOpen(false);
            setAnimatedPiecePositions(null);
            setPromotionMove(null);
            setTranslate({
              x: 0,
              y: 0,
            });
          }}
        >
          <div
            style={{
              left: `calc(${((showPosition % 8) * 100) / 8}% + ${translate.x}px)`,
            }}
            className={`absolute flex flex-col bg-white shadow-md shadow-black ${piece.color == "w" ? (!flip ? "top-0" : "bottom-0") : !flip ? "bottom-0" : "top-0"} w-[12.5%] h-[50%]`}
          >
            <img
              className="w-[95%] h-[95%] hover:cursor-pointer"
              onClick={() => {
                handlePromotionClick("q");
              }}
              src={`/${pieceSet}/${piece.color}/q.svg`}
              alt="chess piece"
            />
            <img
              className="w-[95%] h-[95%] hover:cursor-pointer"
              onClick={() => {
                handlePromotionClick("r");
              }}
              src={`/${pieceSet}/${piece.color}/r.svg`}
              alt="chess piece"
            />
            <img
              className="w-[95%] h-[95%] hover:cursor-pointer"
              onClick={() => {
                handlePromotionClick("b");
              }}
              src={`/${pieceSet}/${piece.color}/b.svg`}
              alt="chess piece"
            />
            <img
              className="w-[95%] h-[95%] hover:cursor-pointer"
              onClick={() => {
                handlePromotionClick("n");
              }}
              src={`/${pieceSet}/${piece.color}/n.svg`}
              alt="chess piece"
            />
          </div>
        </div>
      )}
      <div
        style={{
          left: `calc(${((showPosition % 8) * 100) / 8}% + ${translate.x}px)`,
          top: `calc(${(Math.floor(showPosition / 8) * 100) / 8}% + ${translate.y}px)`,
          animation: `tween-from-${showPreviousPosition}-to-${showPosition} 0.1s`,
        }}
        className={`absolute flex justify-center items-center ${isHeld ? "cursor-grabbing" : "hover:cursor-grab"} ${isHeld ? "z-40 scale-110" : "z-20"} w-[12.5%] h-[12.5%] grow-transition`}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onMouseDown={handleMouseDown}
        onClick={(event) => {
          const { row, col } = getMousePosition(event.clientX, event.clientY);
          const mousePosition = flip ? 63 - (8 * row + col) : 8 * row + col;

          if (0 <= row && row <= 7 && 0 <= col && col <= 7) {
            if (mousePosition == piece.position) {
              setSelectedPiece(isSelected ? piece : null);
            }
          }
        }}
      >
        {animate && <style>{animationKeyFrames}</style>}
        <img
          className="w-[95%] h-[95%] pointer-events-none"
          src={`/${pieceSet}/${piece.color}/${piece.pieceType}.svg`}
          alt="chess piece"
        />
      </div>
    </>
  );
}
