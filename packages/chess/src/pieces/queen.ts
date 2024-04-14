import { Piece } from "../piece";
import { Color } from "../types";

export class Queen extends Piece {
  constructor(position: number, color: Color) {
    super(position, color, "q");
  }

  protected generate_moves(
    white_pieces: Piece[],
    black_pieces: Piece[]
  ): number[] {
    throw new Error("Method not implemented.");
  }
}
