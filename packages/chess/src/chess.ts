import { Board, FenTypes, Piece } from "./piece";
import { Player } from "./player";

export class Chess {
  private white: Player;
  private black: Player;
  private current: Player;
  constructor(private fen: string) {
    this.white = new Player(this.fen, "w");
    this.black = new Player(this.fen, "b");

    if (this.fen.split(" ")[1]! == "w") {
      this.current = this.white;
    } else {
      this.current = this.black;
    }

    this.current.generate_moves(this.fen);
  }

  move(from: number, to: number, promote_to?: "q" | "r" | "b" | "n") {
    if (this.current.move(from, to, promote_to)) {
      this.fen = Chess.update_fen(this.fen, from, to);
      this.current = this.current.color == "w" ? this.black : this.white;
      this.current.capture(to);
    }
  }

  static fen_to_board(fen: string) {
    let piece_placement = fen.split(" ")[0]!.split("/");
    let board: Board = new Array(64).fill("");

    let position_counter = 0;
    piece_placement.forEach((fen_row) => {
      for (let i = 0; i < fen_row.length; i++) {
        let current_character = fen_row[i]!;

        if (isNaN(parseInt(current_character))) {
          board[position_counter] = current_character as FenTypes;
          position_counter++;
          continue;
        }

        position_counter += parseInt(current_character);
      }
    });

    return board;
  }

  static update_piece_placement(
    fen: string,
    from: number,
    to: number,
    from_piece: string
  ) {
    let piece_placement = fen.split(" ")[0]!.split("/");

    let from_row = piece_placement[Math.floor(from / 8)]!;
    let to_row = piece_placement[Math.floor(to / 8)]!;

    piece_placement[Math.floor(from / 8)] = Chess.delete_from_row(
      from,
      from_row
    );
    piece_placement[Math.floor(to / 8)] = Chess.insert_in_row(
      to,
      to_row,
      from_piece
    );

    return piece_placement.join("/");
  }

  static update_fen(fen: string, from: number, to: number) {
    let [piece_placement, current_turn, castling_rights, en_passant] =
      fen.split(" ");

    let from_piece = Chess.get_piece_at(from, fen);

    piece_placement = Chess.update_piece_placement(fen, from, to, from_piece);

    current_turn == "w" ? (current_turn = "b") : (current_turn = "w");

    if (from_piece.toUpperCase() == "K") {
      if (Piece.get_color(from_piece!) == "w") {
        castling_rights!.replace("K", "");
        castling_rights!.replace("Q", "");
      } else {
        castling_rights!.replace("k", "");
        castling_rights!.replace("q", "");
      }
    }

    if (from_piece.toUpperCase() == "R") {
      switch (from) {
        case 0:
          castling_rights!.replace("q", "");
          break;
        case 7:
          castling_rights!.replace("k", "");
          break;
        case 56:
          castling_rights!.replace("Q", "");
          break;
        case 63:
          castling_rights!.replace("K", "");
          break;
      }
    }

    let row_movement = Math.floor(to / 8) - Math.floor(from / 8);
    if (from_piece.toUpperCase() == "P" && Math.abs(row_movement) == 2) {
      if (row_movement < 0) {
        en_passant = Chess.pos_to_algebric(from - 8);
      } else {
        en_passant = Chess.pos_to_algebric(from + 8);
      }
    } else {
      en_passant = "-";
    }

    return (
      piece_placement +
      " " +
      current_turn +
      " " +
      castling_rights +
      " " +
      en_passant
    );
  }

  static algebric_to_pos(algebric_notation: string) {
    let col = algebric_notation.charCodeAt(0) - "a".charCodeAt(0);
    let row = parseInt(algebric_notation[1]!);

    return row * 8 + col;
  }

  static pos_to_algebric(position: number) {
    let row = Math.floor(position / 8);
    let col = position % 8;

    let col_str = String.fromCharCode(97 + col);

    return col_str + (8 - row).toString();
  }

  static get_king_position(fen: string, color: "w" | "b") {
    let piece_placement = fen.split(" ")[0]!.split("/");
    let piece = color == "w" ? "K" : "k";

    for (let row_index = 0; row_index < piece_placement.length; row_index++) {
      let fen_row = piece_placement[row_index]!;

      if (fen_row.includes(piece)) {
        let counter = row_index * 8;
        for (let i = 0; i < fen_row.length; i++) {
          let current_char = fen_row[i]!;
          let parsed_char = parseInt(current_char);

          if (isNaN(parsed_char)) {
            if (current_char == piece) {
              return counter;
            }

            counter++;
            continue;
          }

          counter += parsed_char;
        }
      }
    }
    return -1;
  }

  static get_piece_at(position: number, fen: string) {
    let piece_placement = fen.split(" ")[0]!.split("/");
    let piece = "";

    let row = piece_placement[Math.floor(position / 8)]!;

    let counter = 0;
    for (let i = 0; i < row.length; i++) {
      let current_char = row[i]!;
      let parsed_char = parseInt(current_char);

      if (isNaN(parsed_char)) {
        if (counter == position % 8) {
          piece = current_char;
          return piece;
        }

        counter++;
        continue;
      }

      counter += parsed_char;
      if (counter > position) {
        return piece;
      }
    }

    return piece;
  }

  static insert_in_row(target: number, row: string, piece: string) {
    let current_index = 8 * Math.floor(target / 8);
    for (let i = 0; i < row.length; i++) {
      let current_character = row[i]!;
      let parsed_char = parseInt(current_character);

      if (isNaN(parsed_char)) {
        if (target == current_index) {
          row = row.substring(0, i) + piece + row.substring(i + 1);
          return row;
        }

        current_index++;
        continue;
      }

      if (target <= current_index + parsed_char - 1) {
        let left_num = target - current_index;
        let right_num = parsed_char - left_num - 1;

        if (left_num == 0 && right_num == 0) {
          row = row.substring(0, i) + piece + row.substring(i + 1);
        } else if (left_num == 0) {
          row =
            row.substring(0, i) +
            piece +
            right_num.toString() +
            row.substring(i + 1);
        } else if (right_num == 0) {
          row =
            row.substring(0, i) +
            left_num.toString() +
            piece +
            row.substring(i + 1);
        } else {
          row =
            row.substring(0, i) +
            left_num.toString() +
            piece +
            right_num.toString() +
            row.substring(i + 1);
        }

        return row;
      }

      current_index += parsed_char;
    }

    return row;
  }

  static delete_from_row(target: number, row: string) {
    let current_index = 8 * Math.floor(target / 8);
    for (let i = 0; i < row.length; i++) {
      let current_character = row[i]!;
      let parsed_char = parseInt(current_character);

      if (isNaN(parsed_char)) {
        if (target == current_index) {
          if (isNaN(parseInt(row[i - 1]!))) {
            if (i + 1 >= row.length) {
              row = row.substring(0, i) + "1";
              return row;
            }

            if (isNaN(parseInt(row[i + 1]!))) {
              row = row.substring(0, i) + "1" + row.substring(i + 1);
              return row;
            }

            row =
              row.substring(0, i) +
              (parseInt(row[i + 1]!) + 1).toString() +
              row.substring(i + 2);
            return row;
          } else {
            if (i + 1 >= row.length) {
              row =
                row.substring(0, i - 1) +
                (parseInt(row[i - 1]!) + 1).toString();
              return row;
            }

            if (isNaN(parseInt(row[i + 1]!))) {
              row =
                row.substring(0, i - 1) +
                (parseInt(row[i - 1]!) + 1).toString() +
                row.substring(i + 1);
              return row;
            }

            row =
              row.substring(0, i - 1) +
              (parseInt(row[i - 1]!) + parseInt(row[i + 1]!) + 1).toString() +
              row.substring(i + 2);
            return row;
          }
        }
        current_index++;
        continue;
      }

      current_index += parsed_char;
    }

    return row;
  }
}
