import { Chess } from "@repo/chess";
import { redis, addPlayerToRedisData } from "./redis.js";
import WebSocket from "ws";
import { WebSocketWithInfo } from "./types.js";

export class GameObject {
  private _state: string;
  private _playerInfo: Record<string, string>;
  private _started: boolean;
  private gameId: string;
  private chess = new Chess();

  constructor(gameId: string, initialState: Record<string, string>) {
    this.gameId = gameId;
    const { state, started, ...playerInfo } = initialState;

    if (state == undefined || started == undefined)
      throw Error("Initial state incorrect");

    this._state = state;
    this._started = started == "true";
    this._playerInfo = playerInfo;

    if (this._state != "") {
      this._state.split(",").forEach((moveString) => {
        this.chess.move(moveString);
      });
    }
  }

  get started() {
    return this._started;
  }

  get state() {
    return this._state;
  }

  get isFinished() {
    return this.chess.outcome[0] != "";
  }

  get isFull() {
    return (
      this._playerInfo["white:id"] != undefined &&
      this._playerInfo["black:id"] != undefined
    );
  }

  static generateInitialState() {
    return {
      state: "",
      started: "false",
    };
  }

  async startGame() {
    if (this.isFull && !this.started) {
      this._started = true;
      await redis.hset(this.gameId, {
        started: "true",
      });
    }
  }

  async move(moveString: string) {
    this.chess.move(moveString);
    const state = this.chess.getMoveStrings().join(",");
    this._state = state;

    await redis.hset(this.gameId, {
      state,
    });
  }

  isPlayer(playerId: string) {
    return (
      this._playerInfo["white:id"] == playerId ||
      this._playerInfo["black:id"] == playerId
    );
  }

  getPlayerColor(playerId: string) {
    if (!this.isPlayer(playerId)) return null;

    return this._playerInfo["white:id"] == playerId ? "w" : "b";
  }

  getPlayerId(color: "w" | "b") {
    return color == "w"
      ? this._playerInfo["white:id"]
      : this._playerInfo["black:id"];
  }

  getPlayerProfile(color: "w" | "b") {
    return color == "w"
      ? {
          name: this._playerInfo["white:name"],
          image: this._playerInfo["white:image"],
        }
      : {
          name: this._playerInfo["black:name"],
          image: this._playerInfo["black:image"],
        };
  }

  async addPlayer(ws: WebSocket) {
    const { id, name, image } = ws as WebSocketWithInfo;
    const changeObject = addPlayerToRedisData(this._playerInfo, {
      id,
      name,
      image,
    });

    if (Object.keys(changeObject).length > 0) {
      this._playerInfo = { ...this._playerInfo, ...changeObject };
      await redis.hset(this.gameId, changeObject);
    }
  }
}
