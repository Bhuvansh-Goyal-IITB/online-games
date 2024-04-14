import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";
import { Color, PieceType } from "./types";
import { TOP_LEFT_DIAGONAL_BIT_MASK } from "./precalculated";

export class Player {
  private _pieces: Piece[] = [];

  constructor(
    fen: string,
    private _color: Color
  ) {
    this.initialize_pieces(fen);
  }

  get color() {
    return this._color;
  }

  get pieces() {
    return this._pieces;
  }

  private initialize_pieces(fen: string) {
    let fen_rows = fen.split(" ")[0]!.split("/");

    fen_rows.forEach((row, index) => {
      let position = index * 8;
      for (let i = 0; i < row.length; i++) {
        let char = row[i]!;
        let parsed_char = parseInt(char);

        if (isNaN(parsed_char)) {
          switch (char.toLowerCase()) {
            case "k":
              this.pieces.push(new King(position, this.color));
            case "q":
              this.pieces.push(new Queen(position, this.color));
            case "r":
              this.pieces.push(new Rook(position, this.color));
            case "b":
              this.pieces.push(new Bishop(position, this.color));
            case "n":
              this.pieces.push(new Knight(position, this.color));
            case "p":
              this.pieces.push(new Pawn(position, this.color));
          }
        }

        position += parsed_char;
      }
    });
  }

  get_valid_moves(from: number) {
    let piece = this.pieces.find((piece) => piece.position == from);

    if (!piece) return [] as number[];

    return piece.valid_moves;
  }

  generate_valid_moves(white: Player, black: Player, fen: string) {
    this.pieces.forEach((piece) => {
      piece.generate_valid_moves(white, black, fen);
    });
  }

  move(from: number, to: number, promote_to?: Exclude<PieceType, "k" | "p">) {
    let piece = this.pieces.find((piece) => piece.position == from);

    if (!piece || !piece.valid_moves.includes(to))
      throw Error(
        `Incorrect move: the move from position ${from} to position ${to} is invalid.`
      );

    let is_pawn_promotion =
      piece.piece_type == "p" &&
      ((piece.color == "w" && Math.floor(to / 8) == 0) ||
        (piece.color == "b" && Math.floor(to / 8) == 7));

    if (is_pawn_promotion && !promote_to) {
      throw Error("No promotion piece specified");
    }
    piece.position = to;

    // Castling
    if (piece.piece_type == "k" && Math.abs(from - to) == 2) {
      let rook_from_position =
        from > to ? Math.floor(from / 8) * 8 : Math.floor(from / 8) * 8 + 7;
      let rook_to_position =
        from > to ? rook_from_position + 3 : rook_from_position + 5;

      this.move(rook_from_position, rook_to_position);
    }

    // Pawn Promotion
    if (is_pawn_promotion) {
      this._pieces = this.pieces.map((_piece) => {
        if (piece!.position == _piece.position) {
          switch (promote_to) {
            case "n":
              return new Knight(to, this.color);
            case "b":
              return new Bishop(to, this.color);
            case "r":
              return new Rook(to, this.color);
            case "q":
              return new Queen(to, this.color);
          }
        }

        return _piece;
      });
    }

    this.pieces.forEach((piece) => piece.clear_moves());
  }

  remove_piece(position: number) {
    this._pieces = this.pieces.filter((piece) => piece.position != position);
  }

  is_in_check(opponent: Player): boolean {
    let board = 0n;

    this.pieces.forEach((piece) => {
      board |= 1n << BigInt(63 - piece.position);
    });

    opponent.pieces.forEach((piece) => {
      board |= 1n << BigInt(63 - piece.position);
    });

    return false;
  }
}
