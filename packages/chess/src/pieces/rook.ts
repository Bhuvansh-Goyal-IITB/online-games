import { Board, Piece } from "../piece";

export class Rook extends Piece {
  constructor(initial_position: number, color: "w" | "b") {
    super(initial_position, color, "r");
  }

  generate_moves(board: Board) {}
}
