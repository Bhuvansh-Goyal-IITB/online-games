import { Color, Move, PieceInfo } from "@repo/chess";
import { Dispatch, SetStateAction, createContext, useContext } from "react";

interface IChessContext {
  pieceList: PieceInfo[];
  lastMove: Omit<Move, "capturedPiece"> | null;
  promotionMove: number[] | null;
  validMoves: number[][];
  currentTurn: Color;
  outcome: string[];
  setPromotionMove: Dispatch<SetStateAction<number[] | null>>;
  movePiece: (moveString: string) => void;
  loadMoves: (moveList: string[]) => void;
  loadFen: (fen: string) => void;
  previous: () => void;
  next: () => void;
}

export const ChessContext = createContext<IChessContext | null>(null);

export const useChessContext = () => {
  const context = useContext(ChessContext);

  if (context == null) {
    throw Error(
      "Chess context should only be used inside chess context provider"
    );
  }

  return context;
};
