import { Board, Piece } from "../piece";

export class Pawn extends Piece {
  constructor(initial_position: number, color: "w" | "b") {
    super(initial_position, color, "p");
  }

  generate_moves(fen: string): void {}
}
