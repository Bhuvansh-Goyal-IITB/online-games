"use client";

import { Color, PieceType } from "@repo/chess";
import Piece from "./Piece";
import { Button } from "@ui/components/ui/button";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  memo,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { PieceSet } from "./types";

function PromotionMenu({
  currentTurn,
  promotionMove,
  pieceSet,
  flip,
  setPromotionMove,
  move,
}: {
  currentTurn: Color;
  promotionMove: number[];
  flip: boolean;
  pieceSet: PieceSet;
  setPromotionMove: Dispatch<SetStateAction<number[] | null>>;
  move: (
    from: number,
    to: number,
    promoteTo?: Exclude<PieceType, "k" | "p">
  ) => void;
}) {
  const graphicalPromotionPosition = flip
    ? 63 - promotionMove[1]!
    : promotionMove[1]!;
  return (
    <div
      className="w-full h-full bg-black bg-opacity-50"
      onClick={() => {
        setPromotionMove(null);
      }}
    >
      <div
        style={{
          left: `${((graphicalPromotionPosition % 8) * 100) / 8}%`,
        }}
        className={`absolute flex flex-col bg-white shadow-md shadow-black ${currentTurn == "w" ? (!flip ? "top-0" : "bottom-0") : !flip ? "bottom-0" : "top-0"} w-[12.5%] h-[50%]`}
      >
        <div
          onClick={() => {
            setPromotionMove(null);
            move(promotionMove[0]!, promotionMove[1]!, "q");
          }}
        >
          <img
            className="w-[95%] h-[95%] hover:cursor-pointer"
            src={`/${pieceSet}/${currentTurn}/q.svg`}
            alt="chess piece"
          />
        </div>
        <div
          onClick={() => {
            setPromotionMove(null);
            move(promotionMove[0]!, promotionMove[1]!, "r");
          }}
        >
          <img
            className="w-[95%] h-[95%] hover:cursor-pointer"
            src={`/${pieceSet}/${currentTurn}/r.svg`}
            alt="chess piece"
          />
        </div>
        <div
          onClick={() => {
            setPromotionMove(null);
            move(promotionMove[0]!, promotionMove[1]!, "b");
          }}
        >
          <img
            className="w-[95%] h-[95%] hover:cursor-pointer"
            src={`/${pieceSet}/${currentTurn}/b.svg`}
            alt="chess piece"
          />
        </div>

        <div
          onClick={() => {
            setPromotionMove(null);
            move(promotionMove[0]!, promotionMove[1]!, "n");
          }}
        >
          <img
            className="w-[95%] h-[95%] hover:cursor-pointer"
            src={`/${pieceSet}/${currentTurn}/n.svg`}
            alt="chess piece"
          />
        </div>
      </div>
    </div>
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
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(transparent 0%, transparent 80%, rgba(0, 0, 0, 0.4) 80%)",
          }}
        />
      ) : (
        <div className="w-[30%] h-[30%] rounded-full bg-[#000] bg-opacity-40"></div>
      )}
    </div>
  );
}

function SelectedPiece({
  position,
  flip,
}: {
  position: number;
  flip: boolean;
}) {
  const graphicalPosition = flip ? 63 - position : position;

  return (
    <div
      style={{
        left: `${((graphicalPosition % 8) * 100) / 8}%`,
        top: `${(Math.floor(graphicalPosition / 8) * 100) / 8}%`,
      }}
      className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
    />
  );
}

function LastMove({
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

function ChessBoard({
  pieceList,
  enPassantPosition,
  currentTurn,
  flip,
  lastMove,
  dontAnimate,
  validMoves,
  canMakeMoves,
  move,
}: {
  pieceList: {
    id: string;
    pieceType: PieceType;
    color: Color;
    position: number;
  }[];
  enPassantPosition: number | null;
  currentTurn: Color;
  flip: boolean;
  lastMove: { move: number[]; notation: string } | null;
  validMoves: number[][];
  dontAnimate: boolean;
  canMakeMoves: boolean;
  move: (
    from: number,
    to: number,
    promoteTo?: Exclude<PieceType, "k" | "p">
  ) => void;
}) {
  const [promotionMove, setPromotionMove] = useState<number[] | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{
    id: string;
    pieceType: PieceType;
    color: Color;
    position: number;
  } | null>(null);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    const { top, left, right } = event.currentTarget.getBoundingClientRect();

    const pieceWidth = Math.abs(right - left) / 8;

    const col = Math.floor((event.clientX - left) / pieceWidth);
    const row = Math.floor((event.clientY - top) / pieceWidth);

    const graphicalMouseUpPosition = row * 8 + col;
    const mouseUpPosition = flip
      ? 63 - graphicalMouseUpPosition
      : graphicalMouseUpPosition;

    if (0 <= row && row <= 7 && 0 <= col && col <= 7 && selectedPiece) {
      const selectedMove = validMoves
        .filter((move) => move[0] == selectedPiece.position)
        .find((move) => move[1] == mouseUpPosition);

      if (selectedMove) {
        if (
          selectedPiece.pieceType == "p" &&
          ((selectedPiece.color == "w" && mouseUpPosition <= 7) ||
            (selectedPiece.color == "b" && mouseUpPosition >= 56))
        ) {
          setPromotionMove([selectedMove[0]!, selectedMove[1]!]);
          setSelectedPiece(null);
        } else {
          move(selectedMove[0]!, selectedMove[1]!);
          setSelectedPiece(null);
        }
      } else if (
        pieceList.find((piece) => piece.position == mouseUpPosition) ==
        undefined
      ) {
        setSelectedPiece(null);
      }
    }
  };

  useEffect(() => {
    setSelectedPiece(null);
  }, [pieceList]);

  return (
    <>
      <div
        className="relative max-w-[760px] max-h-[760px]"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onMouseDown={handleMouseDown}
      >
        {promotionMove && (
          <div className="absolute w-full h-full z-[3]">
            <PromotionMenu
              currentTurn={currentTurn}
              flip={flip}
              promotionMove={promotionMove}
              move={move}
              pieceSet="cardinal"
              setPromotionMove={setPromotionMove}
            />
          </div>
        )}
        <img
          className="w-full h-full z-0"
          src={flip ? "/board-flip.svg" : "/board.svg"}
        />
        {(lastMove?.notation.includes("+") ||
          lastMove?.notation.includes("#")) && (
          <Check
            position={
              pieceList.find(
                (piece) => piece.color == currentTurn && piece.pieceType == "k"
              )!.position
            }
            flip={flip}
          />
        )}
        {selectedPiece &&
          canMakeMoves &&
          validMoves
            .filter((move) => move[0]! == selectedPiece.position)
            .map((move) => (
              <ValidMoveSquare
                position={move[1]!}
                isCapturing={
                  move[1]! == enPassantPosition ||
                  pieceList.find((piece) => piece.position == move[1]!) !=
                    undefined
                }
                flip={flip}
              />
            ))}
        {selectedPiece && (
          <SelectedPiece position={selectedPiece.position} flip={flip} />
        )}
        {lastMove && (
          <LastMove
            fromPosition={lastMove.move[0]!}
            toPosition={lastMove.move[1]!}
            flip={flip}
          />
        )}
        {pieceList.map((piece) => (
          <Piece
            key={piece.id}
            piece={piece}
            dontAnimate={dontAnimate}
            pieceSet="cardinal"
            validMoves={validMoves
              .filter((move) => move[0] == piece.position)
              .map((move) => move[1]!)}
            flip={flip}
            promotionMove={promotionMove}
            setSelectedPiece={setSelectedPiece}
            setPromotionMove={setPromotionMove}
            move={move}
          />
        ))}
      </div>
    </>
  );
}

export default ChessBoard;
