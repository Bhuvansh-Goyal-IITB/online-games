import { Board, FenTypes } from "./piece";
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
    let board: Board = {};

    let position_counter = 0;
    piece_placement.forEach((fen_row) => {
      for (let i = 0; i < fen_row.length; i++) {
        let current_character = fen_row.charAt(i);

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

  static update_fen(fen: string, from: number, to: number) {
    let [piece_placement, current_turn, castling_rights, en_passant] =
      fen.split(" ");

    current_turn == "w" ? (current_turn = "b") : (current_turn = "w");

    let fen_rows = piece_placement!.split("/");

    let from_row = fen_rows[Math.floor(from / 8)]!;
    let to_row = fen_rows[Math.floor(to / 8)]!;

    let from_piece: string | null = null;

    let counter = 0;
    for (let i = 0; i < from_row.length; i++) {
      let current_char = from_row[i]!;
      let parsed_char = parseInt(current_char);

      if (isNaN(parsed_char)) {
        if (counter == from % 8) {
          from_piece = current_char;
          break;
        }

        counter++;
        continue;
      }

      counter += parsed_char;
    }

    fen_rows[Math.floor(from / 8)] = delete_from_row(from, from_row);

    fen_rows[Math.floor(to / 8)] = insert_in_row(to, to_row, from_piece!);

    return fen_rows.join("/") + current_turn + castling_rights + en_passant;
  }
}

function insert_in_row(target: number, row: string, piece: string) {
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

function delete_from_row(target: number, row: string) {
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

          if (isNaN(parseInt(row.charAt(i + 1)))) {
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
              row.substring(0, i - 1) + (parseInt(row[i - 1]!) + 1).toString();
            return row;
          }

          if (isNaN(parseInt(row.charAt(i + 1)))) {
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
