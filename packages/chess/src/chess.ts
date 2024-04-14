import { Piece } from "./piece";
import { Player } from "./player";
import { PieceType } from "./types";

export class Chess {
  private _white: Player;
  private _black: Player;
  private _current: Player;

  constructor(private _fen: string) {
    this._white = new Player(this._fen, "w");
    this._black = new Player(this._fen, "b");

    this._current = this._fen.split(" ")[1]! == "w" ? this._white : this._black;

    this._current.generate_valid_moves(this._white, this._black, this._fen);
  }

  get fen() {
    return this._fen;
  }

  move(from: number, to: number, promote_to?: Exclude<PieceType, "k" | "p">) {
    this._current.move(from, to, promote_to);

    let moved_piece = this._current.pieces.find(
      (piece) => piece.position == to
    );

    this._current = this._current.color == "w" ? this._black : this._white;

    if (
      moved_piece!.piece_type == "p" &&
      to == Chess.algebraic_to_position(this._fen.split(" ")[3]!)
    ) {
      moved_piece!.color == "w"
        ? this._current.remove_piece(to + 8)
        : this._current.remove_piece(to - 8);
    } else {
      this._current.remove_piece(to);
    }

    this.update_fen(from, moved_piece!);
    this._current.generate_valid_moves(this._white, this._black, this._fen);
  }

  private update_fen(from: number, moved_piece: Piece) {
    let [piece_placement, current_turn, castling_rights, en_passant] =
      this._fen.split(" ");

    piece_placement = "8/8/8/8/8/8/8/8";

    this._white.pieces.forEach((piece) => {
      piece_placement = Chess.insert_piece(piece_placement!, piece);
    });

    this._black.pieces.forEach((piece) => {
      piece_placement = Chess.insert_piece(piece_placement!, piece);
    });

    current_turn = current_turn! == "w" ? "b" : "w";

    if (
      moved_piece!.piece_type == "p" &&
      Math.abs(from - moved_piece.position) == 16
    ) {
      en_passant =
        from > moved_piece.position
          ? Chess.position_to_algebraic(from - 8)
          : Chess.position_to_algebraic(from + 8);
    } else {
      en_passant = "-";
    }

    if (moved_piece!.piece_type == "k" && moved_piece!.color == "w") {
      castling_rights!.replace("KQ", "");
    } else if (moved_piece!.piece_type == "k" && moved_piece!.color == "b") {
      castling_rights!.replace("kq", "");
    }

    if (moved_piece!.piece_type == "r" && moved_piece!.color == "w") {
      if (castling_rights!.includes("K") && from == 63)
        castling_rights!.replace("K", "");
      else if (castling_rights!.includes("Q") && from == 56)
        castling_rights!.replace("Q", "");
    } else if (moved_piece!.piece_type == "r" && moved_piece!.color == "b") {
      if (castling_rights!.includes("k") && from == 7)
        castling_rights!.replace("k", "");
      else if (castling_rights!.includes("q") && from == 0)
        castling_rights!.replace("q", "");
    }

    if (castling_rights == "") castling_rights = "-";

    this._fen =
      piece_placement +
      " " +
      current_turn +
      " " +
      castling_rights +
      " " +
      en_passant;
  }

  static algebraic_to_position(algebraic: string) {
    let col = algebraic.charCodeAt(0) - 97;
    let row = 8 - parseInt(algebraic[1]!);

    return row * 8 + col;
  }

  static position_to_algebraic(position: number) {
    let row = Math.floor(position / 8);
    let col = position % 8;

    return String.fromCharCode(col + 97) + (8 - row).toString();
  }

  private static insert_piece(piece_placement: string, piece: Piece) {
    let row_index = Math.floor(piece.position / 8);
    let slash_counter = 0;

    let row_start_index = -1;
    let row_end_index = piece_placement.length;

    for (let i = 0; i < piece_placement.length; i++) {
      if (piece_placement[i] == "/") {
        slash_counter++;
        if (slash_counter == row_index) row_start_index = i;
        if (slash_counter == row_index + 1) {
          row_end_index = i;
          break;
        }
      }
    }

    let row = piece_placement.substring(row_start_index + 1, row_end_index);

    let current_position = 8 * row_index;
    for (let i = 0; i < row.length; i++) {
      let char = row[i]!;
      let parsed_char = parseInt(char);

      if (isNaN(parsed_char)) {
        if (piece.position == current_position) {
          row =
            row.substring(0, i) + piece.fen_piece_string + row.substring(i + 1);
          break;
        }

        current_position++;
        continue;
      }

      if (piece.position <= current_position + parsed_char - 1) {
        let left_num = piece.position - current_position;
        let right_num = parsed_char - left_num - 1;

        if (left_num == 0 && right_num == 0) {
          row =
            row.substring(0, i) + piece.fen_piece_string + row.substring(i + 1);
        } else if (left_num == 0) {
          row =
            row.substring(0, i) +
            piece.fen_piece_string +
            right_num.toString() +
            row.substring(i + 1);
        } else if (right_num == 0) {
          row =
            row.substring(0, i) +
            left_num.toString() +
            piece.fen_piece_string +
            row.substring(i + 1);
        } else {
          row =
            row.substring(0, i) +
            left_num.toString() +
            piece.fen_piece_string +
            right_num.toString() +
            row.substring(i + 1);
        }

        break;
      }

      current_position += parsed_char;
    }

    return (
      piece_placement.substring(0, row_start_index + 1) +
      row +
      piece_placement.substring(row_end_index)
    );
  }
}
