import { removeGame } from "./redis.js";
import { Server } from "./server.js";

export interface TimerState {
  w: {
    id: string;
    time: number;
  };
  b: {
    id: string;
    time: number;
  };
}

export class GameTimer {
  private _gameId: string;
  private state: TimerState;
  private intervalId: NodeJS.Timeout | null = null;

  private wAbortTime: number | null = null;
  private bAbortTime: number | null = null;

  private wleft: boolean = false;
  private bleft: boolean = false;

  private totalAbortTime = 60;

  constructor(gameId: string, initialState: TimerState) {
    this._gameId = gameId;
    this.state = initialState;
  }

  get gameId() {
    return this._gameId;
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  removeAbortTimer(joiningPlayerId: string, server: Server) {
    if (joiningPlayerId == this.state.w.id) {
      this.wAbortTime = null;
      if (this.bAbortTime == null)
        server.sendMessageTo(this.state.b.id, "player rejoined");
    }
    if (joiningPlayerId == this.state.b.id) {
      this.bAbortTime = null;
      if (this.wAbortTime == null)
        server.sendMessageTo(this.state.w.id, "player rejoined");
    }
  }

  startAbortTimer(leavingPlayerId: string, server: Server) {
    if (leavingPlayerId == this.state.w.id) {
      this.wAbortTime = this.totalAbortTime;
      if (this.bAbortTime == null)
        server.sendMessageTo(this.state.b.id, "player left");
    }
    if (leavingPlayerId == this.state.b.id) {
      this.bAbortTime = this.totalAbortTime;
      if (this.wAbortTime == null)
        server.sendMessageTo(this.state.w.id, "player left");
    }
  }

  tick(playerColor: "w" | "b", server: Server) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      if (
        this.state[playerColor].time == 0 ||
        this.wAbortTime == 0 ||
        this.bAbortTime == 0
      ) {
        if (this.state[playerColor].time == 0) {
          if (this.wAbortTime == null)
            server.sendMessageTo(this.state.w.id, "timeout", {
              tag: playerColor,
            });
          if (this.bAbortTime == null)
            server.sendMessageTo(this.state.b.id, "timeout", {
              tag: playerColor,
            });
        } else if (this.wAbortTime == 0) {
          if (this.bAbortTime == null)
            server.sendMessageTo(this.state.b.id, "abort", {
              tag: "w",
            });
        } else {
          if (this.wAbortTime == null)
            server.sendMessageTo(this.state.w.id, "abort", {
              tag: "b",
            });
        }
        this.stop();
        server.removeTimer(this._gameId);
        await removeGame(this._gameId);
        return;
      }

      this.state[playerColor].time--;
      if (this.wAbortTime) this.wAbortTime--;
      if (this.bAbortTime) this.bAbortTime--;

      let timePayload: {
        w: number;
        b: number;
        wabort?: number;
        babort?: number;
      } = {
        w: this.state.w.time,
        b: this.state.b.time,
      };

      if (this.wAbortTime != null && this.bAbortTime != null) return;

      if (this.bAbortTime != null) timePayload.babort = this.bAbortTime;
      if (this.wAbortTime != null) timePayload.wabort = this.wAbortTime;

      if (this.wAbortTime == null)
        server.sendMessageTo(this.state.w.id, "time", timePayload);
      if (this.bAbortTime == null)
        server.sendMessageTo(this.state.b.id, "time", timePayload);
    }, 1000);
  }
}
