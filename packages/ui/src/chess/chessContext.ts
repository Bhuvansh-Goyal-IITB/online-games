import { Move, PieceInfo } from "@repo/chess";
import { createContext, useContext } from "react";

interface IChessContext {
  pieceList: PieceInfo[];
  lastMove: Omit<Move, "capturedPiece"> | null;
  validMoves: number[][];
  movePiece: (moveString: string) => void;
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
