"use client";

import { FC, MouseEventHandler, useEffect } from "react";
import { useChessContext } from "./chessContext";
import { Piece } from "./Piece";
import { PromotionMenu } from "./PromotionMenu";
import { Chess } from "@repo/chess";

const ValidMoves: FC = () => {
  const {
    preferences: { flip },
    pieceList,
    selectedPiece,
    fen,
    validMoves,
  } = useChessContext();

  const enPassantFen = fen.split(" ")[3]!;
  const enPassantPosition =
    enPassantFen == "-" ? null : Chess.algebraic_to_position(enPassantFen);

  return (
    <>
      {selectedPiece &&
        validMoves
          .filter((move) => move[0] == selectedPiece.position)
          .map((move) => {
            const displayPosition = flip ? 63 - move[1]! : move[1]!;

            if (
              pieceList.find((piece) => piece.position == move[1]!) ||
              (enPassantPosition && enPassantPosition == move[1]!)
            ) {
              return (
                <div
                  style={{
                    left: `${((displayPosition % 8) * 100) / 8}%`,
                    top: `${(Math.floor(displayPosition / 8) * 100) / 8}%`,
                  }}
                  className="absolute flex justify-center items-center w-[12.5%] h-[12.5%] z-0 scale-transition"
                >
                  <div
                    style={{
                      background:
                        "radial-gradient(circle, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0.35) 82%, rgba(0, 0, 0, 0.4) 84%)",
                    }}
                    className="w-full h-full"
                  />
                </div>
              );
            }
            return (
              <div
                style={{
                  left: `${((displayPosition % 8) * 100) / 8}%`,
                  top: `${(Math.floor(displayPosition / 8) * 100) / 8}%`,
                }}
                className="absolute flex justify-center items-center w-[12.5%] h-[12.5%] z-0 scale-transition"
              >
                <div className="w-[30%] h-[30%] rounded-full bg-[#000] bg-opacity-40" />
              </div>
            );
          })}
    </>
  );
};

const SelectedPiece: FC = () => {
  const {
    preferences: { flip },
    selectedPiece,
  } = useChessContext();

  return (
    <>
      {selectedPiece && (
        <div
          style={{
            left: `${(((flip ? 63 - selectedPiece.position : selectedPiece.position) % 8) * 100) / 8}%`,
            top: `${(Math.floor((flip ? 63 - selectedPiece.position : selectedPiece.position) / 8) * 100) / 8}%`,
          }}
          className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
        />
      )}
    </>
  );
};

export const ChessBoard: FC = () => {
  const {
    pieceList,
    selectedPiece,
    movePiece,
    setPromotionMove,
    setSelectedPiece,
    validMoves,
    preferences: { flip },
  } = useChessContext();

  const handleMouseDown: MouseEventHandler = (event) => {
    const { top, left, right } = event.currentTarget.getBoundingClientRect();

    const pieceWidth = Math.abs(right - left) / 8;

    const col = Math.floor((event.clientX - left) / pieceWidth);
    const row = Math.floor((event.clientY - top) / pieceWidth);

    const displayMouseUpPosition = row * 8 + col;
    const mouseUpPosition = flip
      ? 63 - displayMouseUpPosition
      : displayMouseUpPosition;

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
          movePiece(
            `${Chess.position_to_algebraic(selectedMove[0]!)}${Chess.position_to_algebraic(selectedMove[1]!)}`
          );
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
      <img src="/board.svg" />
      <PromotionMenu />
      {pieceList.map((piece) => (
        <Piece
          key={piece.id}
          color={piece.color}
          pieceType={piece.pieceType}
          position={piece.position}
          validMoves={validMoves
            .filter((move) => move[0] == piece.position)
            .map((move) => move[1]!)}
        />
      ))}
      <SelectedPiece />
      <ValidMoves />
    </div>
  );
};
