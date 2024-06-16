import { nanoid } from "nanoid";
import { WebSocketWithDetails } from "./chess-socket-server.js";
import { Chess, PieceType } from "@repo/chess";

interface PlayerDetails {
  id: string;
  name: string;
  profileImg?: string;
}

const parseMoveString = (moveString: string) => {
  const from = Chess.algebraic_to_position(moveString.substring(0, 2));
  const to = Chess.algebraic_to_position(moveString.substring(2));

  let promoteTo: Exclude<PieceType, "k" | "p"> | undefined = undefined;
  if (moveString.length == 5) {
    promoteTo = moveString.charAt(4) as Exclude<PieceType, "k" | "p">;
  }

  return { from, to, promoteTo };
};

export class Game {
  private _gameId = nanoid(10);
  private _whiteDetails: PlayerDetails | null = null;
  private _blackDetails: PlayerDetails | null = null;
  private chess: Chess = new Chess();
  private _gameStarted = false;

  get gameId() {
    return this._gameId;
  }

  get whiteId() {
    return this._whiteDetails ? this._whiteDetails.id : null;
  }

  get whitePlayerName() {
    return this._whiteDetails ? this._whiteDetails.name : null;
  }

  get whitePlayerProfileImg() {
    return this._whiteDetails ? this._whiteDetails.profileImg ?? null : null;
  }

  get blackId() {
    return this._blackDetails ? this._blackDetails.id : null;
  }

  get blackPlayerName() {
    return this._blackDetails ? this._blackDetails.name : null;
  }

  get blackPlayerProfileImg() {
    return this._blackDetails ? this._blackDetails.profileImg ?? null : null;
  }

  get gameStarted() {
    return this._gameStarted;
  }

  get moves() {
    return this.chess.getMoveStrings();
  }

  move(moveString: string) {
    const { from, to, promoteTo } = parseMoveString(moveString);
    this.chess.move(from, to, promoteTo);
  }

  isGameFinished() {
    return this.chess.outcome[0] != "";
  }

  addUser(ws: WebSocketWithDetails) {
    const { id, playerName, playerProfileImage } = ws;

    if (!this.whiteId && !this.blackId) {
      if (Math.random() > 0.5) {
        this._blackDetails = {
          id,
          name: playerName,
          profileImg: playerProfileImage,
        };
      } else {
        this._whiteDetails = {
          id,
          name: playerName,
          profileImg: playerProfileImage,
        };
      }
    } else if (!this.whiteId) {
      this._whiteDetails = {
        id,
        name: playerName,
        profileImg: playerProfileImage,
      };
      this._gameStarted = true;
    } else if (!this.blackId) {
      this._blackDetails = {
        id,
        name: playerName,
        profileImg: playerProfileImage,
      };
      this._gameStarted = true;
    }
  }
}
