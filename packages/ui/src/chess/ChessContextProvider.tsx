"use client";

import React, {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Chess, Move, PieceType } from "@repo/chess";
import { ChessContext } from "./chessContext";

const parseMoveString = (moveString: string) => {
  const from = Chess.algebraic_to_position(moveString.substring(0, 2));
  const to = Chess.algebraic_to_position(moveString.substring(2));

  let promoteTo: Exclude<PieceType, "k" | "p"> | null = null;
  if (moveString.length == 5) {
    promoteTo = moveString.charAt(4) as Exclude<PieceType, "k" | "p">;
  }

  return { from, to, promoteTo };
};

export const ChessContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const chessRef = useRef(new Chess());

  const [pieceList, setPieceList] = useState(
    chessRef.current.getBoardInfoAt(0).pieceList
  );
  const [index, setIndex] = useState(0);
  const [lastMove, setLastMove] = useState<Omit<Move, "capturedPiece"> | null>(
    null
  );
  const [validMoves, setValidMoves] = useState(chessRef.current.validMoves);

  const moveMultiple = (moveList: string[]) => {
    moveList.forEach((moveString) => {
      const { from, to, promoteTo } = parseMoveString(moveString);

      if (promoteTo) {
        chessRef.current.move(from, to, promoteTo);
      } else {
        chessRef.current.move(from, to);
      }
    });

    const newIndex = index + moveList.length;

    setPieceList(chessRef.current.getBoardInfoAt(newIndex).pieceList);
    setLastMove(chessRef.current.getMoveAt(newIndex - 1));
    setValidMoves(chessRef.current.validMoves);
    setIndex(newIndex);
  };

  const movePiece = (moveString: string) => {
    moveMultiple([moveString]);
  };

  const loadFen = (fen: string) => {
    chessRef.current = new Chess(fen);
    setPieceList(chessRef.current.getBoardInfoAt(0).pieceList);
    setLastMove(null);
    setValidMoves(chessRef.current.validMoves);
    setIndex(0);
  };

  const loadMoves = (moveList: string[]) => {
    chessRef.current = new Chess();
    moveMultiple(moveList);
  };

  const previous = () => {
    if (index > 0) {
      setPieceList(chessRef.current.getBoardInfoAt(index - 1).pieceList);

      if (index == 1) {
        setLastMove(null);
      } else {
        setLastMove(chessRef.current.getMoveAt(index - 2));
      }
      setValidMoves([]);
      setIndex((prev) => prev - 1);
    }
  };

  const next = () => {
    const movesMade = chessRef.current.getMoveNotations().length;
    if (index < movesMade) {
      setPieceList(chessRef.current.getBoardInfoAt(index + 1).pieceList);
      setLastMove(chessRef.current.getMoveAt(index));

      if (index + 1 == movesMade) {
        setValidMoves(chessRef.current.validMoves);
      }
      setIndex((prev) => prev + 1);
    }
  };
  return (
    <ChessContext.Provider
      value={{
        pieceList,
        lastMove,
        validMoves,
        movePiece,
        previous,
        next,
      }}
    >
      {children}
    </ChessContext.Provider>
  );
};
