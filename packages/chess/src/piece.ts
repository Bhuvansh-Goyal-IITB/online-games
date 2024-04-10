export type FenTypes =
  | "r"
  | "n"
  | "b"
  | "k"
  | "q"
  | "p"
  | "R"
  | "N"
  | "B"
  | "K"
  | "Q"
  | "P";

export type PieceType = "r" | "n" | "b" | "k" | "q" | "p";

export interface Board {
  [index: number]: FenTypes;
}

export abstract class Piece {
  private _valid_moves: number[] = [];

  constructor(
    private _position: number,
    private _color: "w" | "b",
    private _piece_type: PieceType
  ) {}

  static check_opponent_piece(
    piece: string | undefined,
    color: "w" | "b",
    check_for: string[]
  ) {
    return (
      piece &&
      Piece.get_color(piece) != color &&
      check_for.includes(piece.toUpperCase())
    );
  }

  static get_color(fen_type: string) {
    return fen_type == fen_type.toUpperCase() ? "w" : "b";
  }

  get color() {
    return this._color;
  }

  get valid_moves() {
    return [...this._valid_moves];
  }

  get position() {
    return this._position;
  }

  get piece_type() {
    return this._piece_type;
  }

  get fen_type() {
    if (this._color == "w") return this._piece_type.toUpperCase();
    return this._piece_type;
  }

  abstract generate_moves(fen: string): void;

  remove_move(to: number) {
    this._valid_moves = this._valid_moves.filter((move) => move != to);
  }

  clear_moves() {
    this._valid_moves = [];
  }

  moveTo(to: number) {
    if (this._valid_moves.includes(to)) {
      this._position = to;
      return true;
    }

    return false;
  }
}
