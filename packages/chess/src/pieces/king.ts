import { Piece } from "../piece";
import { Color } from "../types";

export class King extends Piece {
  constructor(position: number, color: Color) {
    super(position, color, "k");
  }

  protected generate_moves(
    white_pieces: Piece[],
    black_pieces: Piece[]
  ): number[] {
    throw new Error("Method not implemented.");
  }
}
