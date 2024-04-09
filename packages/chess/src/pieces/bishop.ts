import { Board, Piece } from "../piece";

export class Bishop extends Piece {
  constructor(initial_position: number, color: "w" | "b") {
    super(initial_position, color, "b");
  }

  generate_moves(board: Board): void {}
}
