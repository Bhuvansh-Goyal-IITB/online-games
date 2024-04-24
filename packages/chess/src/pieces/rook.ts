import { Piece } from "../piece";
import { Color } from "../types";

export class Rook extends Piece {
  constructor(position: number, color: Color, id: number) {
    super(position, color, "r", id);
  }

  protected generate_moves(
    white_bit_board: bigint,
    black_bit_board: bigint,
    fen: string
  ) {
    let moves: number[] = [];

    let full_bit_board = white_bit_board | black_bit_board;

    let row = Math.floor(this.position / 8);

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

    return moves;
  }
}
