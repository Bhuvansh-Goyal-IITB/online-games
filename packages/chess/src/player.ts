import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";
import { Chess } from "./chess";

export class Player {
  private pieces: Piece[] = [];

  constructor(
    initial_fen: string,
    private _color: "w" | "b"
  ) {
    this.initialize_pieces(initial_fen);
  }

  get color() {
    return this._color;
  }

  private initialize_pieces(initial_fen: string) {
    let board = Chess.fen_to_board(initial_fen);

    Object.entries(board).forEach(([position, piece_type]) => {
      let color = piece_type == piece_type.toUpperCase() ? "w" : "b";
      if (color == this._color) {
        switch (piece_type.toUpperCase()) {
          case "P":
            this.pieces.push(new Pawn(parseInt(position), color));
            break;
          case "R":
            this.pieces.push(new Rook(parseInt(position), color));
            break;
          case "N":
            this.pieces.push(new Knight(parseInt(position), color));
            break;
          case "B":
            this.pieces.push(new Bishop(parseInt(position), color));
            break;
          case "Q":
            this.pieces.push(new Queen(parseInt(position), color));
            break;
          case "K":
            this.pieces.push(new King(parseInt(position), color));
            break;
        }
      }
    });
  }

  get_valid_moves(from: number) {
    let piece = this.pieces.find((piece) => piece.position == from);

    if (!piece) return [] as number[];

    return piece.valid_moves;
  }

  generate_moves(fen: string) {
    this.pieces.forEach((piece) => {
      piece.generate_moves(fen);
      piece.valid_moves.forEach((to) => {
        if (
          Player.isInCheck(
            Chess.update_piece_placement(
              fen,
              piece.position,
              to,
              piece.fen_type
            ),
            this._color
          )
        ) {
          piece.remove_move(to);
        }
      });
    });
  }

  static isInCheck(fen: string, color: "w" | "b") {
    let board = Chess.fen_to_board(fen);

    let king_pos = Chess.get_king_position(fen, color);

    let row = Math.floor(king_pos / 8);
    let col = king_pos % 8;

    for (let position = king_pos - 8; position >= 0; position -= 8) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "R"]))
        return true;
    }

    for (let position = king_pos + 8; position <= 63; position += 8) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "R"]))
        return true;
    }

    for (let position = king_pos + 1; position <= 8 * row + 7; position += 1) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "R"]))
        return true;
    }

    for (let position = king_pos - 1; position >= 8 * row; position -= 1) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "R"]))
        return true;
    }

    for (
      let position = king_pos - 7;
      position >= king_pos + Math.min(row, 7 - col) * -7;
      position -= 7
    ) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "B"]))
        return true;
    }

    for (
      let position = king_pos + 9;
      position <= king_pos + Math.min(7 - row, 7 - col) * 9;
      position += 9
    ) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "B"]))
        return true;
    }

    for (
      let position = king_pos + 7;
      position <= king_pos + Math.min(7 - row, col) * 7;
      position += 7
    ) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "B"]))
        return true;
    }

    for (
      let position = king_pos - 9;
      position >= king_pos + Math.min(row, col) * -9;
      position -= 9
    ) {
      if (board[position] && Piece.get_color(board[position]!) == color) break;
      if (Piece.check_opponent_piece(board[position]!, color, ["Q", "B"]))
        return true;
    }

    if (row - 2 >= 0 && col + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos - 15], color, ["N"]))
        return true;
    }

    if (row - 1 >= 0 && col + 2 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos - 6], color, ["N"]))
        return true;
    }

    if (row + 1 <= 7 && col + 2 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos + 10], color, ["N"]))
        return true;
    }

    if (row + 2 <= 7 && col + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos + 17], color, ["N"]))
        return true;
    }

    if (row + 2 <= 7 && col - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos + 15], color, ["N"]))
        return true;
    }

    if (row + 1 <= 7 && col - 2 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos + 6], color, ["N"]))
        return true;
    }

    if (row - 1 >= 0 && col - 2 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos - 10], color, ["N"]))
        return true;
    }

    if (row - 2 >= 0 && col - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos - 17], color, ["N"]))
        return true;
    }

    if (color == "w" && row - 1 >= 0 && col - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos - 9], color, ["P"]))
        return true;
    }

    if (color == "w" && row - 1 >= 0 && col + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos - 7], color, ["P"]))
        return true;
    }

    if (color == "b" && row + 1 <= 7 && col - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos + 7], color, ["P"]))
        return true;
    }

    if (color == "b" && row + 1 <= 7 && col + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos + 9], color, ["P"]))
        return true;
    }

    if (row - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos - 8], color, ["K"]))
        return true;
    }

    if (row - 1 >= 0 && col + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos - 7], color, ["K"]))
        return true;
    }

    if (col + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos + 1], color, ["K"]))
        return true;
    }

    if (row + 1 <= 7 && col + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos + 9], color, ["K"]))
        return true;
    }

    if (row + 1 <= 7) {
      if (Piece.check_opponent_piece(board[king_pos + 8], color, ["K"]))
        return true;
    }

    if (row + 1 <= 7 && col - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos + 7], color, ["K"]))
        return true;
    }

    if (col - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos - 1], color, ["K"]))
        return true;
    }

    if (row - 1 >= 0 && col - 1 >= 0) {
      if (Piece.check_opponent_piece(board[king_pos - 9], color, ["K"]))
        return true;
    }

    return false;
  }

  move(from: number, to: number, promote_to?: "q" | "r" | "b" | "n") {
    let piece = this.pieces.find((piece) => piece.position == from);

    if (!piece) return false;

    let is_castling = false;

    let is_pawn_promoting =
      piece.piece_type.toUpperCase() == "P" &&
      ((piece.color == "w" && Math.floor(to / 8) == 0) ||
        (piece.color == "b" && Math.floor(to / 8) == 7));

    if (is_pawn_promoting && !promote_to) {
      return false;
    }

    if (piece.moveTo(to)) {
      if (is_castling) {
        // TODO implement castling
      } else if (is_pawn_promoting) {
        this.pieces = this.pieces.map((_piece) => {
          if (_piece.position == to) {
            switch (promote_to) {
              case "q":
                return new Queen(to, _piece.color);
              case "r":
                return new Bishop(to, _piece.color);
              case "b":
                return new Rook(to, _piece.color);
              case "n":
                return new Knight(to, _piece.color);
            }
          }
          return _piece;
        });
      }

      this.pieces.forEach((_piece) => {
        _piece.clear_moves();
      });
      return true;
    }

    return false;
  }

  capture(position: number) {
    this.pieces = this.pieces.filter((piece) => piece.position != position);
  }
}
