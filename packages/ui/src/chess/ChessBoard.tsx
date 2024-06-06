"use client";

import { FC, MouseEventHandler, useEffect } from "react";
import { useChessContext } from "./chessContext";
import { Piece } from "./Piece";
import { PromotionMenu } from "./PromotionMenu";
import { Chess } from "@repo/chess";
import PlayerInfo from "./PlayerInfo";
import { Check, LastMove, SelectedPiece, ValidMoves } from "./BoardHighlights";

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

  let materialAdvantage = 0;

  pieceList.forEach((piece) => {
    const multiplier = piece.color == "w" ? 1 : -1;

    switch (piece.pieceType) {
      case "p":
        materialAdvantage += multiplier;
        break;

      case "r":
        materialAdvantage += multiplier * 5;
        break;

      case "n":
        materialAdvantage += multiplier * 3;
        break;

      case "b":
        materialAdvantage += multiplier * 3;
        break;

      case "q":
        materialAdvantage += multiplier * 9;
        break;

      case "k":
        break;

      default:
        break;
    }
  });

  return (
    <div className="flex flex-col gap-4">
      {!flip ? (
        <PlayerInfo materialAdvantage={-materialAdvantage} playerColor="b" />
      ) : (
        <PlayerInfo materialAdvantage={materialAdvantage} playerColor="w" />
      )}
      <div
        className="relative max-w-[760px] max-h-[760px] border-muted border-[6px] overflow-hidden rounded-md"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        onMouseDown={handleMouseDown}
      >
        <img src={flip ? "/board-flip.svg" : "/board.svg"} />
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
        <Check />
        <LastMove />
        <SelectedPiece />
        <ValidMoves />
      </div>
      {!flip ? (
        <PlayerInfo materialAdvantage={materialAdvantage} playerColor="w" />
      ) : (
        <PlayerInfo materialAdvantage={-materialAdvantage} playerColor="b" />
      )}
    </div>
  );
};
