import { Board, Piece } from "../piece";

export class Queen extends Piece {
  constructor(initial_position: number, color: "w" | "b") {
    super(initial_position, color, "q");
  }

  generate_moves(board: Board) {}
}
