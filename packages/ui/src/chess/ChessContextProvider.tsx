"use client";

import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
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
  animation: boolean;
  pieceSet: PieceSet;
  showValidMoves: boolean;
}

export const ChessContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const chessRef = useRef(
    new Chess("r1bqk2r/pppp1Npp/8/2bnP3/8/6K1/PB4PP/RN1Q3R b kq - 0 1")
  );

  const [preferences, setPreferences] = useState<IChessPreferences>({
    flip: false,
    animation: true,
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
  const [canAnimate, setCanAnimate] = useState(true);
  const [promotionMove, setPromotionMove] = useState<number[] | null>(null);

  const [selectedPiece, setSelectedPiece] = useState<Omit<
    PieceInfo,
    "id"
  > | null>(null);

  const currentTurn = fen.split(" ")[1]! as Color;
  const moveList = chessRef.current.getMoveNotations();

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

    if (movesMade == 1) {
      setCanAnimate(true);
    } else {
      setCanAnimate(false);
    }
  };

  const movePiece = (moveString: string) => {
    moveMultiple([moveString]);
  };

  const undo = () => {
    const movesMade = chessRef.current.getMoveNotations().length;
    if (movesMade > 0) {
      chessRef.current.undo();
      const boardInfo = chessRef.current.getBoardInfoAt(movesMade - 1);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);

      if (movesMade == 1) {
        setLastMove(null);
      } else {
        setLastMove(chessRef.current.getMoveAt(movesMade - 2));
      }
      setValidMoves(chessRef.current.validMoves);
      setIndex(movesMade - 1);
      setCanAnimate(false);
    }
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
      setCanAnimate(true);
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
      setCanAnimate(true);
    }
  };

  const last = () => {
    const movesMade = chessRef.current.getMoveNotations().length;
    if (index != movesMade) {
      const boardInfo = chessRef.current.getBoardInfoAt(movesMade);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);

      if (movesMade > 0) {
        setLastMove(chessRef.current.getMoveAt(movesMade - 1));
      }
      setValidMoves(chessRef.current.validMoves);
      setIndex(movesMade);
      setCanAnimate(false);
    }
  };

  const first = () => {
    if (index != 0) {
      const movesMade = chessRef.current.getMoveNotations().length;

      const boardInfo = chessRef.current.getBoardInfoAt(0);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);
      setLastMove(null);

      if (movesMade == 0) {
        setValidMoves(chessRef.current.validMoves);
      } else {
        setValidMoves([]);
      }
      setIndex(0);
      setCanAnimate(false);
    }
  };

  const goToMove = (moveIndex: number) => {
    const movesMade = chessRef.current.getMoveNotations().length;
    if (moveIndex < 0 || moveIndex > movesMade - 1 || moveIndex + 1 == index)
      return;

    const boardInfo = chessRef.current.getBoardInfoAt(moveIndex + 1);
    setFen(boardInfo.fen);
    setPieceList(boardInfo.pieceList);

    setLastMove(chessRef.current.getMoveAt(moveIndex));
    if (moveIndex == movesMade - 1) {
      setValidMoves(chessRef.current.validMoves);
    } else {
      setValidMoves([]);
    }
    setIndex(moveIndex + 1);
    setCanAnimate(false);
  };

  const outcome = chessRef.current.outcome;
  return (
    <ChessContext.Provider
      value={{
        pieceList,
        lastMove,
        fen,
        selectedPiece,
        canAnimate: canAnimate && preferences.animation,
        validMoves,
        currentTurn,
        outcome,
        promotionMove,
        preferences,
        currentIndex: index,
        moveList,
        setSelectedPiece,
        setPreferences,
        setPromotionMove,
        loadFen,
        loadMoves,
        movePiece,
        undo,
        previous,
        next,
        first,
        last,
        goToMove,
      }}
    >
      {children}
    </ChessContext.Provider>
  );
};
