import { Chess } from "../chess";
import { Board, Piece } from "../piece";

export class Pawn extends Piece {
  constructor(initial_position: number, color: "w" | "b") {
    super(initial_position, color, "p");
  }

  generate_moves(fen: string) {
    let board = Chess.fen_to_board(fen);

    let col = this.position % 8;

    let en_passant = fen.split(" ")[3]!;

    if (this.color == "w") {
      if (!board[this.position - 8]) {
        this.push_move(this.position - 8);
      }

      if (
        col - 1 >= 0 &&
        board[this.position - 9] &&
        Piece.get_color(board[this.position - 9]!) != this.color
      ) {
        this.push_move(this.position - 9);
      }

      if (
        col + 1 <= 7 &&
        board[this.position - 7] &&
        Piece.get_color(board[this.position - 7]!) != this.color
      ) {
        this.push_move(this.position - 7);
      }

      if (this.position - 9 == Chess.algebric_to_pos(en_passant)) {
        this.push_move(this.position - 9);
      }

      if (this.position - 7 == Chess.algebric_to_pos(en_passant)) {
        this.push_move(this.position - 7);
      }
    } else {
      if (!board[this.position + 8]) {
        this.push_move(this.position + 8);
      }

      if (
        col + 1 <= 7 &&
        board[this.position + 9] &&
        Piece.get_color(board[this.position + 9]!) != this.color
      ) {
        this.push_move(this.position + 9);
      }

      if (
        col - 1 >= 0 &&
        board[this.position + 7] &&
        Piece.get_color(board[this.position + 7]!) != this.color
      ) {
        this.push_move(this.position + 7);
      }

      if (this.position + 9 == Chess.algebric_to_pos(en_passant)) {
        this.push_move(this.position + 9);
      }

      if (this.position + 7 == Chess.algebric_to_pos(en_passant)) {
        this.push_move(this.position + 7);
      }
    }
  }
}
