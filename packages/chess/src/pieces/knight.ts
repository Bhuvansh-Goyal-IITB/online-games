import { Board, Piece } from "../piece";

export class Knight extends Piece {
  constructor(initial_position: number, color: "w" | "b") {
    super(initial_position, color, "n");
  }

  generate_moves(board: Board): void {}
}
