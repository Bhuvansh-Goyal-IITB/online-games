import { nanoid } from "nanoid";
import { WebSocketWithDetails } from "./chess-socket-server.js";

interface PlayerDetails {
  id: string;
  name: string;
  profileImg?: string;
}

export class Game {
  private _gameId = nanoid(10);
  private _whiteDetails: PlayerDetails | null = null;
  private _blackDetails: PlayerDetails | null = null;
  private _moves: string[] = [];
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
    return this._moves;
  }

  move(moveString: string) {
    this._moves.push(moveString);
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
