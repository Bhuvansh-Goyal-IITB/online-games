import { GameSocketServer } from "./game-server.js";

export interface PlayerTimeInfo {
  [key: string]: { playerTag: string; timeInSec: number };
}

export class GameTimer {
  private _gameId: string;
  private playerInfo: PlayerTimeInfo;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    gameId: string,
    initialInfo: PlayerTimeInfo,
    startPlayerId: string,
    gameSocketServer: GameSocketServer,
  ) {
    this._gameId = gameId;
    this.playerInfo = initialInfo;
    this.tick(startPlayerId, gameSocketServer);
  }

  get gameId() {
    return this._gameId;
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
