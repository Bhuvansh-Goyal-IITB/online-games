import { Chess } from "./chess";
import { Player } from "./player";
import { Color, PieceType } from "./types";

export abstract class Piece {
  private _valid_moves: number[] = [];

  constructor(
    private _position: number,
    private _color: Color,
    private _piece_type: PieceType
  ) {}

  get color() {
    return this._color;
  }

  get valid_moves() {
    return this._valid_moves;
  }

  get bit_position() {
    return 1n << BigInt(63 - this.position);
  }

  get position() {
    return this._position;
  }

  set position(position: number) {
    if (0 <= position && position <= 63) {
      this._position = position;
    } else {
      throw Error(
        `Wrong position: for the piece ${this.fen_piece_string} on position ${this.position}, position is being set to ${position}`
      );
    }
  }

  get piece_type() {
    return this._piece_type;
  }

  get fen_piece_string() {
    if (this.color == "w") return this.piece_type.toUpperCase();
    return this.piece_type;
  }

  protected abstract generate_moves(
    white_bit_board: bigint,
    black_bit_board: bigint,
    fen: string
  ): number[];

  generate_valid_moves(
    white_bit_board: bigint,
    black_bit_board: bigint,
    white: Player,
    black: Player,
    fen: string
  ) {
    let moves = this.generate_moves(white_bit_board, black_bit_board, fen);

    let from = this.position;
    let captured_piece: Piece | undefined;
    moves.forEach((move) => {
      this.position = move;

      if (
        this.piece_type == "p" &&
        move == Chess.algebraic_to_position(fen.split(" ")[3]!)
      ) {
        captured_piece =
          this.color == "w"
            ? black.remove_piece(move + 8)
            : white.remove_piece(move - 8);
      } else {
        captured_piece =
          this.color == "w"
            ? black.remove_piece(move)
            : white.remove_piece(move);
      }

      if (this.color == "w" && !white.is_in_check(black)) {
        if (this.piece_type == "k" && Math.abs(from - move) == 2) {
          this.position = from;
          if (!white.is_in_check(black)) {
            this.position = from > move ? move + 1 : move - 1;

            if (!white.is_in_check(black)) {
              this._valid_moves.push(move);
            }
          }
        } else {
          this.valid_moves.push(move);
        }
      } else if (this.color == "b" && !black.is_in_check(white)) {
        if (this.piece_type == "k" && Math.abs(from - move) == 2) {
          this.position = from;
          if (!black.is_in_check(white)) {
            this.position = from > move ? move + 1 : move - 1;

            if (!black.is_in_check(white)) {
              this._valid_moves.push(move);
            }
          }
        } else {
          this.valid_moves.push(move);
        }
      }

      if (captured_piece) {
        this.color == "w"
          ? black.pieces.push(captured_piece)
          : white.pieces.push(captured_piece);
      }
    });

    this.position = from;
  }

  clear_moves() {
    this._valid_moves = [];
  }
}
