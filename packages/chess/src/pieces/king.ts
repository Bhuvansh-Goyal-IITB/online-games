import { Board, Piece } from "../piece";

export class King extends Piece {
  constructor(initial_position: number, color: "w" | "b") {
    super(initial_position, color, "k");
  }

  generate_moves(fen: string): void {}
}
