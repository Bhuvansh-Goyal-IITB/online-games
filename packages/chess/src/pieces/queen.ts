import { Piece } from "../piece.js";
import { Color } from "../types.js";

export class Queen extends Piece {
  constructor(position: number, color: Color, id?: string) {
    super(position, color, "q", id);
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
    for (let position = this.position - 8; position >= 0; position -= 8) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    for (let position = this.position + 8; position <= 63; position += 8) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    for (
      let position = this.position + 1;
      position <= 8 * row + 7;
      position += 1
    ) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    for (let position = this.position - 1; position >= 8 * row; position -= 1) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    for (
      let position = this.position - 7;
      position >= this.position + Math.min(row, 7 - col) * -7;
      position -= 7
    ) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    for (
      let position = this.position + 9;
      position <= this.position + Math.min(7 - row, 7 - col) * 9;
      position += 9
    ) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    for (
      let position = this.position + 7;
      position <= this.position + Math.min(7 - row, col) * 7;
      position += 7
    ) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    for (
      let position = this.position - 9;
      position >= this.position + Math.min(row, col) * -9;
      position -= 9
    ) {
      let bit_position = 1n << BigInt(63 - position);
      if (!(full_bit_board & bit_position)) {
        moves.push(position);
        continue;
      } else if (opponent_bit_board & bit_position) {
        moves.push(position);
      }
      break;
    }

    return moves;
  }
}
