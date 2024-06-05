"use client";

import React, {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Chess, Color, Move, PieceInfo, PieceType } from "@repo/chess";
import { ChessContext } from "./chessContext";
import { PieceSet } from "./types";

const parseMoveString = (moveString: string) => {
  const from = Chess.algebraic_to_position(moveString.substring(0, 2));
  const to = Chess.algebraic_to_position(moveString.substring(2));

  let promoteTo: Exclude<PieceType, "k" | "p"> | null = null;
  if (moveString.length == 5) {
    promoteTo = moveString.charAt(4) as Exclude<PieceType, "k" | "p">;
  }

  return { from, to, promoteTo };
};

export interface IChessPreferences {
  flip: boolean;
  animations: boolean;
  pieceSet: PieceSet;
  showValidMoves: boolean;
}

export const ChessContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const chessRef = useRef(new Chess());

  const [preferences, setPreferences] = useState<IChessPreferences>({
    flip: false,
    animations: true,
    pieceSet: "cardinal",
    showValidMoves: true,
  });
  const [fen, setFen] = useState(chessRef.current.getBoardInfoAt(0).fen);
  const [pieceList, setPieceList] = useState(
    chessRef.current.getBoardInfoAt(0).pieceList
  );
  const [index, setIndex] = useState(0);
  const [lastMove, setLastMove] = useState<Omit<Move, "capturedPiece"> | null>(
    null
  );
  const [validMoves, setValidMoves] = useState(chessRef.current.validMoves);
  const [promotionMove, setPromotionMove] = useState<number[] | null>(null);

  const [selectedPiece, setSelectedPiece] = useState<Omit<
    PieceInfo,
    "id"
  > | null>(null);

  const currentTurn = fen.split(" ")[1]! as Color;

  const moveMultiple = (moveList: string[]) => {
    let movesMade = 0;
    for (let i = 0; i < moveList.length; i++) {
      const { from, to, promoteTo } = parseMoveString(moveList[i]!);

      if (promoteTo) {
        chessRef.current.move(from, to, promoteTo);
      } else {
        chessRef.current.move(from, to);
      }

      movesMade++;
      if (chessRef.current.outcome[0] != "") break;
    }

    const newIndex = index + movesMade;

    const boardInfo = chessRef.current.getBoardInfoAt(newIndex);
    setFen(boardInfo.fen);
    setPieceList(boardInfo.pieceList);
    setLastMove(chessRef.current.getMoveAt(newIndex - 1));
    setValidMoves(chessRef.current.validMoves);
    setIndex(newIndex);
  };

  const movePiece = (moveString: string) => {
    moveMultiple([moveString]);
  };

  const loadFen = (fen: string) => {
    chessRef.current = new Chess(fen);
    const boardInfo = chessRef.current.getBoardInfoAt(0);
    setFen(boardInfo.fen);
    setPieceList(boardInfo.pieceList);
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
      const boardInfo = chessRef.current.getBoardInfoAt(index - 1);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);

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
      const boardInfo = chessRef.current.getBoardInfoAt(index + 1);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);
      setLastMove(chessRef.current.getMoveAt(index));

      if (index + 1 == movesMade) {
        setValidMoves(chessRef.current.validMoves);
      }
      setIndex((prev) => prev + 1);
    }
  };

  const outcome = chessRef.current.outcome;
  return (
    <ChessContext.Provider
      value={{
        pieceList,
        lastMove,
        fen,
        selectedPiece,
        validMoves,
        currentTurn,
        outcome,
        promotionMove,
        preferences,
        setSelectedPiece,
        setPreferences,
        setPromotionMove,
        loadFen,
        loadMoves,
        movePiece,
        previous,
        next,
      }}
    >
      {children}
    </ChessContext.Provider>
  );
};
