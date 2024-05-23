export type PieceType = "r" | "n" | "b" | "k" | "q" | "p";
export interface PieceInfo {
  pieceType: PieceType;
  position: number;
  color: Color;
  id: number;
}

export interface Board {
  currentTurn: Color;
  validMoves: Move[];
  isInCheck: boolean;
  pieces: PieceInfo[];
  fen: string;
}

export interface Move {
  from: number;
  to: number;
  isCapturing: boolean;
  isCastling: boolean;
  isPromoting: boolean;
}
export type Color = "w" | "b";
