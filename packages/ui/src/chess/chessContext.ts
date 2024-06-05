import { Color, Move, PieceInfo } from "@repo/chess";
import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { IChessPreferences } from "./ChessContextProvider";

interface IChessContext {
  pieceList: PieceInfo[];
  lastMove: Omit<Move, "capturedPiece"> | null;
  fen: string;
  canAnimate: boolean;
  selectedPiece: Omit<PieceInfo, "id"> | null;
  promotionMove: number[] | null;
  validMoves: number[][];
  currentTurn: Color;
  outcome: string[];
  preferences: IChessPreferences;
  setPreferences: Dispatch<SetStateAction<IChessPreferences>>;
  setSelectedPiece: Dispatch<SetStateAction<Omit<PieceInfo, "id"> | null>>;
  setPromotionMove: Dispatch<SetStateAction<number[] | null>>;
  movePiece: (moveString: string) => void;
  loadMoves: (moveList: string[]) => void;
  loadFen: (fen: string) => void;
  previous: () => void;
  next: () => void;
  first: () => void;
  last: () => void;
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
