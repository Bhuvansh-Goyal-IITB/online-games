import { Piece } from "../piece";
import { Color } from "../types";

export class Knight extends Piece {
  constructor(position: number, color: Color, id: number) {
    super(position, color, "n", id);
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

    let opponent_bit_board =
      this.color == "w" ? black_bit_board : white_bit_board;

    if (row - 2 >= 0 && col + 1 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position - 15));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 15);
      }
    }

    if (row - 1 >= 0 && col + 2 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position - 6));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 6);
      }
    }

    if (row + 1 <= 7 && col + 2 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position + 10));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 10);
      }
    }

    if (row + 2 <= 7 && col + 1 <= 7) {
      let bit_position = 1n << BigInt(63 - (this.position + 17));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 17);
      }
    }

    if (row + 2 <= 7 && col - 1 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position + 15));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 15);
      }
    }

    if (row + 1 <= 7 && col - 2 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position + 6));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position + 6);
      }
    }

    if (row - 1 >= 0 && col - 2 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position - 10));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 10);
      }
    }

    if (row - 2 >= 0 && col - 1 >= 0) {
      let bit_position = 1n << BigInt(63 - (this.position - 17));
      if (
        !(full_bit_board & bit_position) ||
        opponent_bit_board & bit_position
      ) {
        moves.push(this.position - 17);
      }
    }

    return moves;
  }
}
