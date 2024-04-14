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
    white_pieces: Piece[],
    black_pieces: Piece[],
    fen: string
  ): number[];

  generate_valid_moves(white: Player, black: Player, fen: string) {
    let moves = this.generate_moves(white.pieces, black.pieces, fen);

    moves.forEach((move) => {
      this.position = move;
      if (this.color == "w" && !white.is_in_check(black)) {
        this.valid_moves.push(move);
      } else if (this.color == "b" && !black.is_in_check(white)) {
        this.valid_moves.push(move);
      }
    });
  }

  clear_moves() {
    this._valid_moves = [];
  }
}
