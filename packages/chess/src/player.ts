import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";
import { Color, PieceType } from "./types";
import {
  BLACK_KING_PAWN_BIT_MASK,
  BOTTOM_LEFT_DIAGONAL_BIT_MASK,
  BOTTOM_RIGHT_DIAGONAL_BIT_MASK,
  DOWN_BIT_MASK,
  KING_BIT_MASK,
  KNIGHT_BIT_MASK,
  LEFT_BIT_MASK,
  RIGHT_BIT_MASK,
  TOP_LEFT_DIAGONAL_BIT_MASK,
  TOP_RIGHT_DIAGONAL_BIT_MASK,
  UP_BIT_MASK,
  WHITE_KING_PAWN_BIT_MASK,
} from "./precalculated";

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
          if (
            (this.color == "w" && char == char.toUpperCase()) ||
            (this.color == "b" && char != char.toUpperCase())
          ) {
            switch (char.toLowerCase()) {
              case "k":
                this.pieces.push(new King(position, this.color));
                break;
              case "q":
                this.pieces.push(new Queen(position, this.color));
                break;
              case "r":
                this.pieces.push(new Rook(position, this.color));
                break;
              case "b":
                this.pieces.push(new Bishop(position, this.color));
                break;
              case "n":
                this.pieces.push(new Knight(position, this.color));
                break;
              case "p":
                this.pieces.push(new Pawn(position, this.color));
                break;
            }
          }

          position++;
          continue;
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

    if (piece.piece_type == "k" && Math.abs(from - to) == 2) {
      let rook_from_position =
        from > to ? Math.floor(from / 8) * 8 : Math.floor(from / 8) * 8 + 7;
      let rook_to_position =
        from > to ? rook_from_position + 3 : rook_from_position + 5;

      this.move(rook_from_position, rook_to_position);
    }

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
    let removed_piece: Piece | undefined;
    this._pieces = this.pieces.filter((piece) => {
      if (piece.position == position) {
        removed_piece = piece;
      }
      return piece.position != position;
    });

    return removed_piece;
  }

  is_in_check(opponent: Player): boolean {
    let board = 0n;
    let king = this.pieces.find((piece) => piece.piece_type == "k")!;

    this.pieces.forEach((piece) => {
      board |= 1n << BigInt(63 - piece.position);
    });

    opponent.pieces.forEach((piece) => {
      board |= 1n << BigInt(63 - piece.position);
    });

    for (let i = 0; i < opponent.pieces.length; i++) {
      let opponent_piece = opponent.pieces[i]!;

      switch (opponent_piece.piece_type) {
        case "r":
          if (
            (UP_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                DOWN_BIT_MASK[opponent_piece.position]! &
                UP_BIT_MASK[king.position]! &
                board
              )) ||
            (DOWN_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                UP_BIT_MASK[opponent_piece.position]! &
                DOWN_BIT_MASK[king.position]! &
                board
              )) ||
            (LEFT_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                RIGHT_BIT_MASK[opponent_piece.position]! &
                LEFT_BIT_MASK[king.position]! &
                board
              )) ||
            (RIGHT_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                LEFT_BIT_MASK[opponent_piece.position]! &
                RIGHT_BIT_MASK[king.position]! &
                board
              ))
          ) {
            return true;
          }
          break;
        case "n":
          if (KNIGHT_BIT_MASK[king.position]! & opponent_piece.bit_position) {
            return true;
          }
          break;
        case "b":
          if (
            (TOP_LEFT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                BOTTOM_RIGHT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                TOP_LEFT_DIAGONAL_BIT_MASK[king.position]! &
                board
              )) ||
            (TOP_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                BOTTOM_LEFT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                TOP_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
                board
              )) ||
            (BOTTOM_LEFT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                TOP_RIGHT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                BOTTOM_LEFT_DIAGONAL_BIT_MASK[king.position]! &
                board
              )) ||
            (BOTTOM_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                TOP_LEFT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                BOTTOM_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
                board
              ))
          ) {
            return true;
          }
          break;
        case "k":
          if (KING_BIT_MASK[king.position]! & opponent_piece.bit_position) {
            return true;
          }
        case "q":
          if (
            (UP_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                DOWN_BIT_MASK[opponent_piece.position]! &
                UP_BIT_MASK[king.position]! &
                board
              )) ||
            (DOWN_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                UP_BIT_MASK[opponent_piece.position]! &
                DOWN_BIT_MASK[king.position]! &
                board
              )) ||
            (LEFT_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                RIGHT_BIT_MASK[opponent_piece.position]! &
                LEFT_BIT_MASK[king.position]! &
                board
              )) ||
            (RIGHT_BIT_MASK[king.position]! & opponent_piece.bit_position &&
              !(
                LEFT_BIT_MASK[opponent_piece.position]! &
                RIGHT_BIT_MASK[king.position]! &
                board
              )) ||
            (TOP_LEFT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                BOTTOM_RIGHT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                TOP_LEFT_DIAGONAL_BIT_MASK[king.position]! &
                board
              )) ||
            (TOP_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                BOTTOM_LEFT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                TOP_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
                board
              )) ||
            (BOTTOM_LEFT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                TOP_RIGHT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                BOTTOM_LEFT_DIAGONAL_BIT_MASK[king.position]! &
                board
              )) ||
            (BOTTOM_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
              opponent_piece.bit_position &&
              !(
                TOP_LEFT_DIAGONAL_BIT_MASK[opponent_piece.position]! &
                BOTTOM_RIGHT_DIAGONAL_BIT_MASK[king.position]! &
                board
              ))
          ) {
            return true;
          }
          break;
        case "p":
          if (
            this.color == "w" &&
            WHITE_KING_PAWN_BIT_MASK[king.position]! &
              opponent_piece.bit_position
          ) {
            return true;
          } else if (
            this.color == "b" &&
            BLACK_KING_PAWN_BIT_MASK[king.position]! &
              opponent_piece.bit_position
          ) {
            return true;
          }
          break;
      }
    }

    return false;
  }
}
