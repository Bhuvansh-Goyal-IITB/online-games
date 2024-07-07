import { GameSocketServer } from "./game-server.js";
import { redis, subscriber } from "./redis.js";

export interface PlayerTimeInfo {
  [key: string]: { playerTag: string; timeInSec: number };
}

interface AbortInfo {
  playerId: string;
  timerId: NodeJS.Timeout;
}

export class GameTimer {
  private _gameId: string;
  private playerInfo: PlayerTimeInfo;
  private intervalId: NodeJS.Timeout | null = null;
  private abortInfoList: AbortInfo[] = [];

  constructor(gameId: string, initialInfo: PlayerTimeInfo) {
    this._gameId = gameId;
    this.playerInfo = initialInfo;
  }

  get gameId() {
    return this._gameId;
  }

  startAbortTimer(leavingPlayerId: string, gameSocketServer: GameSocketServer) {
    for (const playerId in this.playerInfo) {
      if (playerId != leavingPlayerId) {
        gameSocketServer.sendMessageTo(playerId, "player left", {
          tag: this.playerInfo[leavingPlayerId]!.playerTag,
        });
      }
    }

    const timerId = setTimeout(async () => {
      const numJoinedPlayers = await redis.scard(`${this._gameId}:joined`);

      if (numJoinedPlayers <= 1) {
        if (this.intervalId) clearInterval(this.intervalId);

        for (const playerId in this.playerInfo) {
          if (playerId != leavingPlayerId) {
            gameSocketServer.sendMessageTo(playerId, "game aborted", {
              tag: this.playerInfo[leavingPlayerId]!.playerTag,
            });
          }
        }

        await gameSocketServer.removeGame(this._gameId);
        await gameSocketServer.removeTimer(this._gameId);
      } else {
        for (const playerId in this.playerInfo) {
          if (playerId != leavingPlayerId) {
            gameSocketServer.sendMessageTo(playerId, "player aborted", {
              tag: this.playerInfo[leavingPlayerId]!.playerTag,
            });
          }
        }

        await redis.hdel(
          this._gameId,
          `${this.playerInfo[leavingPlayerId]!.playerTag}:id`,
        );
      }
    }, 1000 * 30);

    this.abortInfoList.push({
      playerId: leavingPlayerId,
      timerId,
    });
  }

  revertAbort(joiningPlayerId: string, gameSocketServer: GameSocketServer) {
    const abortInfo = this.abortInfoList.find(
      (abortInfo) => abortInfo.playerId == joiningPlayerId,
    );

    if (!abortInfo) return;

    clearTimeout(abortInfo.timerId);
    subscriber.unsubscribe(`timer:${this._gameId.substring(0, 6)}`);

    this.abortInfoList = this.abortInfoList.filter(
      (abortInfo) => abortInfo.playerId != joiningPlayerId,
    );

    for (const playerId in this.playerInfo) {
      if (playerId != joiningPlayerId) {
        gameSocketServer.sendMessageTo(playerId, "player rejoined", {
          tag: this.playerInfo[joiningPlayerId]!.playerTag,
        });
      }
    }
  }

  tick(currentTickPlayerId: string, gameSocketServer: GameSocketServer) {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(async () => {
      const prevCurrentPlayerInfo = this.playerInfo[currentTickPlayerId]!;

      if (prevCurrentPlayerInfo.timeInSec == 0) {
        clearInterval(this.intervalId!);
        await gameSocketServer.removeTimer(this._gameId);
        return;
      }

      this.playerInfo[currentTickPlayerId] = {
        ...prevCurrentPlayerInfo,
        timeInSec: prevCurrentPlayerInfo.timeInSec - 1,
      };

      const timePayload: { [key: string]: number } = {};

      for (const playerId in this.playerInfo) {
        const currentPlayerInfo = this.playerInfo[playerId]!;
        timePayload[currentPlayerInfo.playerTag] = currentPlayerInfo.timeInSec;
      }

      for (const playerId in this.playerInfo) {
        gameSocketServer.sendMessageTo(playerId, "time", timePayload);
      }
    }, 1000);
  }
}
