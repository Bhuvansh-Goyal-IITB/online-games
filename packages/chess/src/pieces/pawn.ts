import { Chess } from "../chess.js";
import { Piece } from "../piece.js";
import { Color } from "../types.js";

export class Pawn extends Piece {
  constructor(position: number, color: Color, id?: string) {
    super(position, color, "p", id);
  }

  protected generate_moves(
    white_bit_board: bigint,
    black_bit_board: bigint,
    fen: string
  ) {
    let moves: number[] = [];

    let full_bit_board = white_bit_board | black_bit_board;

    let row = Math.floor(this.position / 8);
    let col = this.position % 8;

    if (this.color == "w") {
      if (row - 1 >= 0 && !(full_bit_board & (this.bit_position << 8n))) {
        moves.push(this.position - 8);
        if (row == 6 && !(full_bit_board & (this.bit_position << 16n))) {
          moves.push(this.position - 16);
        }
      }

      if (
        row - 1 >= 0 &&
        col + 1 <= 7 &&
        (black_bit_board & (this.bit_position << 7n) ||
          this.position - 7 == Chess.algebraic_to_position(fen.split(" ")[3]!))
      ) {
        moves.push(this.position - 7);
      }

      if (
        row - 1 >= 0 &&
        col - 1 >= 0 &&
        (black_bit_board & (this.bit_position << 9n) ||
          this.position - 9 == Chess.algebraic_to_position(fen.split(" ")[3]!))
      ) {
        moves.push(this.position - 9);
      }
    } else {
      if (row + 1 <= 7 && !(full_bit_board & (this.bit_position >> 8n))) {
        moves.push(this.position + 8);
        if (row == 1 && !(full_bit_board & (this.bit_position >> 16n))) {
          moves.push(this.position + 16);
        }
      }

      if (
        row + 1 <= 7 &&
        col + 1 <= 7 &&
        (white_bit_board & (this.bit_position >> 9n) ||
          this.position + 9 == Chess.algebraic_to_position(fen.split(" ")[3]!))
      ) {
        moves.push(this.position + 9);
      }

      if (
        row + 1 <= 7 &&
        col - 1 >= 0 &&
        (white_bit_board & (this.bit_position >> 7n) ||
          this.position + 7 == Chess.algebraic_to_position(fen.split(" ")[3]!))
      ) {
        moves.push(this.position + 7);
      }
    }
    return moves;
  }
}
