export type PieceType = "r" | "n" | "b" | "k" | "q" | "p";
export interface PieceInfo {
  pieceType: PieceType;
  position: number;
  color: Color;
  id: number;
}
export type Color = "w" | "b";
