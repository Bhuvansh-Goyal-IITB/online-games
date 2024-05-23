"use client";

import { Board, Color, Move, PieceInfo, PieceType } from "@repo/chess";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  memo,
  useEffect,
  useState,
} from "react";
import Piece from "./Piece";
import { PieceSet } from "./types";

function Hover({ position, flip }: { position: number; flip: boolean }) {
  const showPosition = flip ? 63 - position : position;

  return (
    <div
      style={{
        left: `${((showPosition % 8) * 100) / 8}%`,
        top: `${(Math.floor(showPosition / 8) * 100) / 8}%`,
      }}
      className="absolute w-[12.5%] h-[12.5%] z-10 pointer-events-none bg-opacity-10 bg-neutral-950"
    />
  );
}

function ValidMoveSquare({
  position,
  isCapturing,
  flip,
}: {
  position: number;
  isCapturing: boolean;
  flip: boolean;
}) {
  const showPosition = flip ? 63 - position : position;

  return (
    <div
      style={{
        left: `${((showPosition % 8) * 100) / 8}%`,
        top: `${(Math.floor(showPosition / 8) * 100) / 8}%`,
      }}
      className="absolute flex justify-center items-center w-[12.5%] h-[12.5%] z-0 scale-transition"
    >
      {isCapturing ? (
        <div className="w-full h-full opacity-40">
          <img className="w-full h-full" src="/capture.svg" alt="capture" />
        </div>
      ) : (
        <div className="w-[30%] h-[30%] rounded-full bg-[#000] bg-opacity-40"></div>
      )}
    </div>
  );
}

function MovedPieceSquare({
  fromPosition,
  toPosition,
  flip,
}: {
  fromPosition: number;
  toPosition: number;
  flip: boolean;
}) {
  const fromShowPosition = flip ? 63 - fromPosition : fromPosition;
  const toShowPosition = flip ? 63 - toPosition : toPosition;

  return (
    <>
      <div
        style={{
          left: `${((fromShowPosition % 8) * 100) / 8}%`,
          top: `${(Math.floor(fromShowPosition / 8) * 100) / 8}%`,
        }}
        className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
      />
      <div
        style={{
          left: `${((toShowPosition % 8) * 100) / 8}%`,
          top: `${(Math.floor(toShowPosition / 8) * 100) / 8}%`,
        }}
        className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
      />
    </>
  );
}

function SelectedPieceSquare({
  position,
  flip,
}: {
  position: number;
  flip: boolean;
}) {
  const showPosition = flip ? 63 - position : position;

  return (
    <div
      style={{
        left: `${((showPosition % 8) * 100) / 8}%`,
        top: `${(Math.floor(showPosition / 8) * 100) / 8}%`,
      }}
      className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
    />
  );
}

function Check({ position, flip }: { position: number; flip: boolean }) {
  const showPosition = flip ? 63 - position : position;

  return (
    <div
      style={{
        left: `${((showPosition % 8) * 100) / 8}%`,
        top: `${(Math.floor(showPosition / 8) * 100) / 8}%`,
      }}
      className="absolute flex justify-center items-center w-[12.5%] h-[12.5%] z-0"
    >
      <div className="w-[80%] h-[80%] rounded-full bg-red-600 blur-lg" />
      {/* <div className="w-full h-full bg-red-700 op" /> */}
    </div>
  );
}

interface PiecesProps {
  board: Board;
  flip: boolean;
  pieceSet: PieceSet;
  promotionMove: Move | null;
  animatedPiecePositions: number[] | null;
  setHoverPosition: Dispatch<SetStateAction<number | null>>;
  setSelectedPiece: Dispatch<SetStateAction<PieceInfo | null>>;
  setAnimatedPiecePositions: Dispatch<SetStateAction<number[] | null>>;
  setPromotionMove: Dispatch<SetStateAction<Move | null>>;
  movePiece: (move: Move, promoteTo?: Exclude<PieceType, "k" | "p">) => void;
}

const Pieces = memo(
  ({
    board,
    promotionMove,
    pieceSet,
    animatedPiecePositions,
    flip,
    setHoverPosition,
    setSelectedPiece,
    setAnimatedPiecePositions,
    setPromotionMove,
    movePiece,
  }: PiecesProps) => {
    return (
      <>
        {board.pieces.map((piece) => {
          let { id, position, color } = piece;
          let pieceValidMoves = board.validMoves.filter(
            (move) => position == move.from
          );

          return (
            <Piece
              key={id}
              pieceSet={pieceSet}
              piece={piece}
              promotePosition={
                promotionMove
                  ? promotionMove.from == position
                    ? promotionMove.to
                    : null
                  : null
              }
              setHoverPosition={setHoverPosition}
              setSelectedPiece={setSelectedPiece}
              setAnimatedPiecePositions={setAnimatedPiecePositions}
              setPromotionMove={setPromotionMove}
              validMoves={pieceValidMoves}
              flip={flip}
              movePiece={movePiece}
              animate={
                animatedPiecePositions != null &&
                animatedPiecePositions.includes(position)
              }
            />
          );
        })}
      </>
    );
  },
  (prev, next) => {
    return (
      prev.board == next.board &&
      prev.flip == next.flip &&
      prev.pieceSet == next.pieceSet &&
      prev.promotionMove == next.promotionMove &&
      prev.animatedPiecePositions == next.animatedPiecePositions
    );
  }
);

function ChessBoard({
  board,
  canMakeMoves,
  flip,
  lastMove,
  pieceSet,
  animatedPiecePositions,
  movePiece,
  setAnimatedPiecePositions,
}: {
  board: Board;
  pieceSet: PieceSet;
  canMakeMoves: boolean;
  flip: boolean;
  lastMove: Move | null;
  animatedPiecePositions: number[] | null;
  movePiece: (move: Move, promoteTo?: Exclude<PieceType, "k" | "p">) => void;
  setAnimatedPiecePositions: Dispatch<SetStateAction<number[] | null>>;
}) {
  const [promotionMove, setPromotionMove] = useState<Move | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<PieceInfo | null>(null);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    const { top, left, right } = event.currentTarget.getBoundingClientRect();

    const pieceWidth = Math.abs(right - left) / 8;

    let col = Math.floor((event.clientX - left) / pieceWidth);
    let row = Math.floor((event.clientY - top) / pieceWidth);

    let clickPosition = flip ? 63 - (row * 8 + col) : row * 8 + col;

    if (0 <= row && row <= 7 && 0 <= col && col <= 7 && selectedPiece) {
      const move = board.validMoves
        .filter((move) => selectedPiece.position == move.from)
        .find((move) => move.to == clickPosition);

      if (move) {
        if (move.isPromoting) {
          setPromotionMove(move);
          setSelectedPiece(null);
          return;
        } else {
          movePiece(move);
        }

        if (move.isCastling) {
          move.from > move.to
            ? setAnimatedPiecePositions([move.to + 1, move.to])
            : setAnimatedPiecePositions([move.to - 1, move.to]);
        } else {
          setAnimatedPiecePositions([move.to]);
        }

        setSelectedPiece(null);
      } else if (
        !board.pieces.map((piece) => piece.position).includes(clickPosition)
      ) {
        setSelectedPiece(null);
      }
    }
  };

  useEffect(() => {
    setSelectedPiece(null);
  }, [board]);

  return (
    <>
      <div
        className="relative max-w-[800px] max-h-[800px]"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          className="w-full h-full z-0"
          src={flip ? "/board-flip.svg" : "/board.svg"}
        />
        {selectedPiece && (
          <SelectedPieceSquare position={selectedPiece.position} flip={flip} />
        )}
        {hoverPosition && <Hover position={hoverPosition} flip={flip} />}
        {selectedPiece &&
          canMakeMoves &&
          board.validMoves
            .filter((move) => move.from == selectedPiece.position)
            .map(({ from, to, isCapturing }) => (
              <ValidMoveSquare
                key={from.toString() + "," + to.toString()}
                position={to}
                flip={flip}
                isCapturing={isCapturing}
              />
            ))}
        {board.isInCheck && (
          <Check
            position={
              board.pieces.find(
                (piece) =>
                  piece.color == board.currentTurn && piece.pieceType == "k"
              )!.position
            }
            flip={flip}
          />
        )}
        {lastMove && (
          <MovedPieceSquare
            fromPosition={lastMove.from}
            toPosition={lastMove.to}
            flip={flip}
          />
        )}

        <Pieces
          board={board}
          animatedPiecePositions={animatedPiecePositions}
          pieceSet={pieceSet}
          setAnimatedPiecePositions={setAnimatedPiecePositions}
          setPromotionMove={setPromotionMove}
          setHoverPosition={setHoverPosition}
          setSelectedPiece={setSelectedPiece}
          promotionMove={promotionMove}
          flip={flip}
          movePiece={movePiece}
        />
      </div>
    </>
  );
}

export default ChessBoard;
