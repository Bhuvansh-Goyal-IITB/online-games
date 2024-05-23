import { Piece } from "./piece";
import { Player } from "./player";
import { Move, PieceInfo, PieceType } from "./types";

export class Chess {
  private _white: Player;
  private _black: Player;
  private _current: Player;
  private _fen: string;
  private _outcome: "" | "w" | "b" | "d" = "";
  private _outcomeMethod:
    | ""
    | "checkmate"
    | "stalemate"
    | "three fold repetetion"
    | "insufficient material"
    | "resignation"
    | "agreement"
    | "repetetion" = "";

  private _repetetionHistory: string[] = [];

  constructor(fen?: string) {
    this._fen =
      fen ?? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    this._white = new Player(this._fen, "w");
    this._black = new Player(this._fen, "b");

    this._current = this._fen.split(" ")[1]! == "w" ? this._white : this._black;

    this._current.generate_valid_moves(this._white, this._black, this._fen);
    this.pushToRepetetionHistory();
  }

  get outcome() {
    return [this._outcome, this._outcomeMethod];
  }

  get board() {
    let pieces: PieceInfo[] = [];

    this._white.pieces.forEach((piece) => {
      pieces.push({
        pieceType: piece.piece_type,
        position: piece.position,
        color: piece.color,
        id: piece.id,
      });
    });

    this._black.pieces.forEach((piece) => {
      pieces.push({
        pieceType: piece.piece_type,
        position: piece.position,
        color: piece.color,
        id: piece.id,
      });
    });

    let validMoves: Move[] = [];

    const currentColor = this._current.color;

    this._current.pieces.forEach((piece) => {
      piece.valid_moves.forEach((move) => {
        let isPromoting = false;

        if (piece.piece_type == "p") {
          if (piece.color == "w" && Math.floor(move / 8) == 0) {
            isPromoting = true;
          } else if (piece.color == "b" && Math.floor(move / 8) == 7) {
            isPromoting = true;
          }
        }

        validMoves.push({
          from: piece.position,
          to: move,
          isCapturing:
            move == Chess.algebraic_to_position(this.fen.split(" ")[3]!) ||
            (currentColor == "w"
              ? (this._black.bitBoard & (1n << BigInt(63 - move))) != 0n
              : (this._white.bitBoard & (1n << BigInt(63 - move))) != 0n),
          isCastling:
            piece.piece_type == "k" && Math.abs(piece.position - move) == 2,
          isPromoting,
        });
      });
    });

    return {
      currentTurn: this._current.color,
      isInCheck: this._current.is_in_check(
        this._current.color == "w" ? this._black : this._white
      ),
      validMoves,
      pieces,
      fen: this.fen,
    };
  }

  get fen() {
    return this._fen;
  }

  move(from: number, to: number, promote_to?: Exclude<PieceType, "k" | "p">) {
    let notation = "";

    if (this._outcome != "") return;

    let moved_piece = this._current.pieces.find(
      (piece) => piece.position == from
    );

    let ambiguityResolver = "";

    this._current.pieces.forEach((piece) => {
      if (
        piece.piece_type != "p" &&
        piece.piece_type == moved_piece!.piece_type
      ) {
        if (
          piece.valid_moves.includes(to) &&
          piece.position != moved_piece!.position
        ) {
          if (piece.position % 8 != moved_piece!.position % 8) {
            ambiguityResolver = Chess.position_to_algebraic(
              moved_piece!.position
            )[0]!;
          } else {
            ambiguityResolver = Chess.position_to_algebraic(
              moved_piece!.position
            )[1]!;
          }
        }
      }
    });

    this._current.move(from, to, promote_to);

    this._current = this._current.color == "w" ? this._black : this._white;

    let capturedPiece =
      moved_piece!.piece_type == "p" &&
      to == Chess.algebraic_to_position(this._fen.split(" ")[3]!)
        ? moved_piece!.color == "w"
          ? this._current.remove_piece(to + 8)
          : this._current.remove_piece(to - 8)
        : this._current.remove_piece(to);

    if (moved_piece!.piece_type == "p" && capturedPiece != null) {
      notation += Chess.position_to_algebraic(from)[0];
    } else if (moved_piece!.piece_type != "p") {
      notation += moved_piece!.piece_type.toUpperCase();
    }

    notation += ambiguityResolver;

    if (capturedPiece != null) {
      notation += "x";
    }

    notation += Chess.position_to_algebraic(to);

    if (moved_piece!.piece_type == "k" && Math.abs(from - to) == 2) {
      if (from > to) {
        notation = "O-O-O";
      } else {
        notation = "O-O";
      }
    }

    if (moved_piece!.piece_type == "p") {
      if (moved_piece!.color == "w" && Math.floor(to / 8) == 0) {
        notation += `=${promote_to!.toUpperCase()}`;
      } else if (moved_piece!.color == "b" && Math.floor(to / 8) == 7) {
        notation += `=${promote_to!.toUpperCase()}`;
      }
    }

    this.update_fen(from, moved_piece!, capturedPiece);
    this._current.generate_valid_moves(this._white, this._black, this._fen);

    if (
      this._current.is_in_check(
        this._current.color == "w" ? this._black : this._white
      )
    ) {
      let hasValidMoves = false;

      for (let i = 0; i < this._current.pieces.length; i++) {
        const piece = this._current.pieces[i]!;

        if (piece.valid_moves.length > 0) {
          hasValidMoves = true;
          break;
        }
      }
      if (hasValidMoves) {
        notation += "+";
      } else {
        notation += "#";
      }
    }

    this.pushToRepetetionHistory();
    this.checkOutcome();

    return notation;
  }

  private pushToRepetetionHistory() {
    let repetetionHistory = this.fen.split(" ").slice(0, 3).join(" ");

    const enPassant = this.fen.split(" ")[3]!;

    if (enPassant != "-") {
      const enPassantPosition = Chess.algebraic_to_position(enPassant);

      const row = Math.floor(enPassantPosition / 8);
      const col = enPassantPosition % 8;

      let direction = this._current.color == "w" ? 1 : -1;

      if (0 < col && col < 7) {
        if (
          this._current.pieces.find(
            (piece) =>
              piece.piece_type == "p" &&
              (piece.position == (row + direction) * 8 + (col - 1) ||
                piece.position == (row + direction) * 8 + (col + 1))
          )
        ) {
          repetetionHistory += ` ${enPassant}`;
        }
      } else if (col == 0) {
        if (
          this._current.pieces.find(
            (piece) =>
              piece.piece_type == "p" &&
              piece.position == (row + direction) * 8 + (col + 1)
          )
        ) {
          repetetionHistory += ` ${enPassant}`;
        }
      } else {
        if (
          this._current.pieces.find(
            (piece) =>
              piece.piece_type == "p" &&
              piece.position == (row + direction) * 8 + (col - 1)
          )
        ) {
          repetetionHistory += ` ${enPassant}`;
        }
      }
    }

    this._repetetionHistory.push(repetetionHistory);
  }

  private checkOutcome() {
    let hasValidMoves = false;

    for (let i = 0; i < this._current.pieces.length; i++) {
      const piece = this._current.pieces[i]!;

      if (piece.valid_moves.length > 0) {
        hasValidMoves = true;
        break;
      }
    }

    if (!hasValidMoves) {
      if (
        this._current.is_in_check(
          this._current.color == "w" ? this._black : this._white
        )
      ) {
        this._outcome = this._current.color == "w" ? "b" : "w";
        this._outcomeMethod = "checkmate";
        return;
      } else {
        this._outcome = "d";
        this._outcomeMethod = "stalemate";
        return;
      }
    }

    let frequency = 0;
    this._repetetionHistory.forEach((position) => {
      if (position == this._repetetionHistory.at(-1)) frequency++;
    });

    if (frequency == 3) {
      this._outcome = "d";
      this._outcomeMethod = "three fold repetetion";
      return;
    }

    const halfMove = parseInt(this.fen.split(" ")[4]!);

    if (halfMove == 100) {
      this._outcome = "d";
      this._outcomeMethod = "repetetion";
      return;
    }
  }

  private update_fen(from: number, moved_piece: Piece, capturedPiece?: Piece) {
    let [
      piece_placement,
      current_turn,
      castling_rights,
      en_passant,
      halfMove,
      fullMove,
    ] = this._fen.split(" ");

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
      castling_rights = castling_rights!.replace("K", "");
      castling_rights = castling_rights!.replace("Q", "");
    } else if (moved_piece!.piece_type == "k" && moved_piece!.color == "b") {
      castling_rights = castling_rights!.replace("k", "");
      castling_rights = castling_rights!.replace("q", "");
    }

    if (moved_piece!.piece_type == "r" && moved_piece!.color == "w") {
      if (castling_rights!.includes("K") && from == 63)
        castling_rights = castling_rights!.replace("K", "");
      else if (castling_rights!.includes("Q") && from == 56)
        castling_rights = castling_rights!.replace("Q", "");
    } else if (moved_piece!.piece_type == "r" && moved_piece!.color == "b") {
      if (castling_rights!.includes("k") && from == 7)
        castling_rights = castling_rights!.replace("k", "");
      else if (castling_rights!.includes("q") && from == 0)
        castling_rights = castling_rights!.replace("q", "");
    }

    if (castling_rights == "") castling_rights = "-";

    if (moved_piece.piece_type == "p" || capturedPiece) {
      halfMove = "0";
    } else {
      halfMove = (parseInt(halfMove!) + 1).toString();
    }

    if (current_turn == "w") {
      fullMove = (parseInt(fullMove!) + 1).toString();
    }

    this._fen =
      piece_placement +
      " " +
      current_turn +
      " " +
      castling_rights +
      " " +
      en_passant +
      " " +
      halfMove +
      " " +
      fullMove;
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
