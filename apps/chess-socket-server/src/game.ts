import { nanoid } from "nanoid";

export class Game {
  private _gameId = nanoid(10);
  private _whiteId: string | null = null;
  private _blackId: string | null = null;
  private _moves: string[] = [];
  private _gameStarted = false;

  get gameId() {
    return this._gameId;
  }

  get whiteId() {
    return this._whiteId;
  }

  get blackId() {
    return this._blackId;
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

  addUser(playerId: string) {
    if (!this.whiteId && !this.blackId) {
      if (Math.random() > 0.5) {
        this._blackId = playerId;
      } else {
        this._whiteId = playerId;
      }
    } else if (!this.whiteId) {
      this._whiteId = playerId;
      this._gameStarted = true;
    } else if (!this.blackId) {
      this._blackId = playerId;
      this._gameStarted = true;
    }
  }
}
