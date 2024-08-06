import { GameSocketServer } from "./game-server.js";
import { redis, subscriber } from "./redis.js";

export interface PlayerTimeInfo {
  [key: string]: { playerTag: string; timeInSec: number };
}

interface AbortInfo {
  playerId: string;
  timerId: NodeJS.Timeout;
}

// TODO: delete a game if it has been created but no one is joining (after a certain duration)
export class GameTimer {
  private _gameId: string;
  private playerInfo: PlayerTimeInfo;
  private intervalId: NodeJS.Timeout | null = null;
  private abortInfoList: AbortInfo[] = [];
  private currentlyJoinedPlayers = new Set<string>();

  constructor(gameId: string, initialInfo: PlayerTimeInfo) {
    this._gameId = gameId;
    this.playerInfo = initialInfo;

    for (const playerId in this.playerInfo) {
      this.currentlyJoinedPlayers.add(playerId);
    }

    subscriber.subscribe(`timer:${this._gameId.substring(0, 6)}`);
  }

  get gameId() {
    return this._gameId;
  }

  startAbortTimer(leavingPlayerId: string, gameSocketServer: GameSocketServer) {
    this.currentlyJoinedPlayers.delete(leavingPlayerId);

    this.currentlyJoinedPlayers.forEach((playerId) => {
      if (playerId != leavingPlayerId) {
        gameSocketServer.sendMessageTo(playerId, "player left", {
          tag: this.playerInfo[leavingPlayerId]!.playerTag,
        });
      }
    });

    const timerId = setTimeout(async () => {
      const numJoinedPlayers = this.currentlyJoinedPlayers.size;

      if (numJoinedPlayers <= 1) {
        if (this.intervalId) clearInterval(this.intervalId);

        this.currentlyJoinedPlayers.forEach((playerId) => {
          if (playerId != leavingPlayerId) {
            gameSocketServer.sendMessageTo(playerId, "game aborted", {
              tag: this.playerInfo[leavingPlayerId]!.playerTag,
            });
          }
        });

        await gameSocketServer.removeGame(this._gameId);
      } else {
        this.currentlyJoinedPlayers.forEach((playerId) => {
          if (playerId != leavingPlayerId) {
            gameSocketServer.sendMessageTo(playerId, "player aborted", {
              tag: this.playerInfo[leavingPlayerId]!.playerTag,
            });
          }
        });
        delete this.playerInfo[leavingPlayerId];

        await redis.hdel(
          this._gameId,
          `${this.playerInfo[leavingPlayerId]!.playerTag}:id`,
        );
      }
    }, 1000 * 60);

    this.abortInfoList.push({
      playerId: leavingPlayerId,
      timerId,
    });
  }

  revertAbort(joiningPlayerId: string, gameSocketServer: GameSocketServer) {
    this.currentlyJoinedPlayers.add(joiningPlayerId);
    const abortInfo = this.abortInfoList.find(
      (abortInfo) => abortInfo.playerId == joiningPlayerId,
    );

    if (!abortInfo) return;

    clearTimeout(abortInfo.timerId);

    this.abortInfoList = this.abortInfoList.filter(
      (abortInfo) => abortInfo.playerId != joiningPlayerId,
    );

    this.currentlyJoinedPlayers.forEach((playerId) => {
      if (playerId != joiningPlayerId) {
        gameSocketServer.sendMessageTo(playerId, "player rejoined", {
          tag: this.playerInfo[joiningPlayerId]!.playerTag,
        });
      }
    });
  }

  stopAll() {
    subscriber.unsubscribe(`timer:${this._gameId.substring(0, 6)}`);

    this.abortInfoList.forEach((abortInfo) => {
      clearTimeout(abortInfo.timerId);
    });

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  tick(currentTickPlayerId: string, gameSocketServer: GameSocketServer) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      const prevCurrentPlayerInfo = this.playerInfo[currentTickPlayerId]!;

      if (prevCurrentPlayerInfo.timeInSec == 0) {
        if (this.intervalId) clearInterval(this.intervalId);
        gameSocketServer.removeTimer(this._gameId);
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

      this.currentlyJoinedPlayers.forEach((playerId) => {
        gameSocketServer.sendMessageTo(playerId, "time", timePayload);
      });
    }, 1000);
  }
}
