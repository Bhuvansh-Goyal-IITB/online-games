import { Piece } from "../piece";
import { Color } from "../types";

export class King extends Piece {
  constructor(position: number, color: Color) {
    super(position, color, "k");
  }

  protected generate_moves(
    white_bit_board: bigint,
    black_bit_board: bigint,
    fen: string
  ) {
    let moves: number[] = [];

    let full_bit_board = white_bit_board | black_bit_board;

    let castling_rights = fen.split(" ")[2]!;

    let row = Math.floor(this.position / 8);
    let col = this.position % 8;

    let opponent_bit_board =
      this.color == "w" ? black_bit_board : white_bit_board;

    if (row - 1 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position - 8));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 8);
      }
    }

    if (row - 1 >= 0 && col + 1 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position - 7));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 7);
      }
    }

    if (col + 1 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position + 1));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 1);
      }
    }

    if (row + 1 <= 7 && col + 1 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position + 9));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 9);
      }
    }

    if (row + 1 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position + 8));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 8);
      }
    }

    if (row + 1 <= 7 && col - 1 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position + 7));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 7);
      }
    }

    if (col - 1 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position - 1));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 1);
      }
    }

    if (row - 1 >= 0 && col - 1 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position - 9));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 9);
      }
    }

    if (this.color == "w") {
      if (castling_rights.includes("K") && !(full_bit_board & (3n << 1n))) {
        moves.push(62);
      }

      if (castling_rights.includes("Q") && !(full_bit_board & (7n << 4n))) {
        moves.push(58);
      }
    } else {
      if (castling_rights.includes("k") && !(full_bit_board & (3n << 57n))) {
        moves.push(6);
      }

      if (castling_rights.includes("q") && !(full_bit_board & (7n << 60n))) {
        moves.push(2);
      }
    }

    return moves;
  }
}
