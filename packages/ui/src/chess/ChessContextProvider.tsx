"use client";

import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { Chess, Move, PieceType } from "@repo/chess";
import { ChessContext } from "./chessContext";

interface ChessContextProviderProps {
  initialFen?: string;
  initialMoves?: string[];
  children: ReactNode;
}

const parseMoveString = (moveString: string) => {
  const from = Chess.algebraic_to_position(moveString.substring(0, 2));
  const to = Chess.algebraic_to_position(moveString.substring(2));

  let promoteTo: Exclude<PieceType, "k" | "p"> | null = null;
  if (moveString.length == 5) {
    promoteTo = moveString.charAt(4) as Exclude<PieceType, "k" | "p">;
  }

  return { from, to, promoteTo };
};

export const ChessContextProvider: FC<ChessContextProviderProps> = ({
  children,
  initialFen,
  initialMoves,
}) => {
  const [chess, setChess] = useState(new Chess(initialFen));

  const [pieceList, setPieceList] = useState(chess.getBoardInfoAt(0).pieceList);
  const [index, setIndex] = useState(0);
  const [lastMove, setLastMove] = useState<Omit<Move, "capturedPiece"> | null>(
    null
  );
  const [validMoves, setValidMoves] = useState(chess.validMoves);

  const moveMultiple = (moveList: string[]) => {
    moveList.forEach((moveString) => {
      const { from, to, promoteTo } = parseMoveString(moveString);

      if (promoteTo) {
        chess.move(from, to, promoteTo);
      } else {
        chess.move(from, to);
      }
    });

    const newIndex = index + moveList.length;

    setPieceList(chess.getBoardInfoAt(newIndex).pieceList);
    setLastMove(chess.getMoveAt(newIndex - 1));
    setValidMoves(chess.validMoves);
    setIndex(newIndex);
  };

  useEffect(() => {
    if (initialMoves) {
      moveMultiple(initialMoves);
    }

    return () => {
      setChess(new Chess(initialFen));
    };
  }, []);

  return (
    <ChessContext.Provider
      value={{
        pieceList,
        lastMove,
        validMoves,
      }}
    >
      {children}
    </ChessContext.Provider>
  );
};
