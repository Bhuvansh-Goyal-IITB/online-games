import { Piece } from "./piece.js";

export type PieceType = "r" | "n" | "b" | "k" | "q" | "p";

export interface PieceInfo {
  pieceType: PieceType;
  position: number;
  color: Color;
  id: string;
}

export interface Board {
  currentTurn: Color;
  validMoves: Move[];
  isInCheck: boolean;
  pieces: PieceInfo[];
  fen: string;
}

export interface Move {
  move: number[];
  moveString: string;
  notation: string;
  capturedPiece: Piece | null;
}
export type Color = "w" | "b";
