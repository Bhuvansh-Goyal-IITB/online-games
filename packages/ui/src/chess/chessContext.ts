import { Color, Move, PieceInfo } from "@repo/chess";
import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { IChessPreferences, IPlayerInfo } from "./ChessContextProvider";

interface IChessContext {
  pieceList: PieceInfo[];
  playerColor: Color | null;
  lastMove: Omit<Move, "capturedPiece"> | null;
  selfGame: boolean;
  fen: string;
  canAnimate: boolean;
  selectedPiece: Omit<PieceInfo, "id"> | null;
  promotionMove: number[] | null;
  validMoves: number[][];
  currentTurn: Color;
  outcome: string[];
  preferences: IChessPreferences;
  currentIndex: number;
  moveList: string[];
  setPreferences: Dispatch<SetStateAction<IChessPreferences>>;
  setSelectedPiece: Dispatch<SetStateAction<Omit<PieceInfo, "id"> | null>>;
  setPromotionMove: Dispatch<SetStateAction<number[] | null>>;
  setCurrentPlayerColor: Dispatch<SetStateAction<Color | null>>;
  movePiece: (moveString: string) => void;
  loadMoves: (moveList: string[]) => void;
  loadFen: (fen: string) => void;
  undo: () => void;
  previous: () => void;
  next: () => void;
  first: () => void;
  last: () => void;
  goToMove: (moveIndex: number) => void;
  getPlayerInfo: (playerColor: Color) => IPlayerInfo | undefined;
  getPGN: () => string;
  resign: (resigningPlayerColor: Color) => void;
  draw: () => void;
  startGame: () => void;
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
