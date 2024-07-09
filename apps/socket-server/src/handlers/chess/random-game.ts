import { GameSocketServer } from "../../game-server.js";
import { redis } from "../../redis.js";
import { MessageHandler, WebSocketWithInfo } from "../../types.js";
import { ChessGame } from "../../games/index.js";

export const randomGameHandler: (
  gameSocketServer: GameSocketServer,
) => MessageHandler = (gameSocketServer) => {
  return async (ws, _data) => {
    const myWs = ws as WebSocketWithInfo;
    try {
      const numWaitingPlayers = await redis.scard("chess:waiting");

      if (numWaitingPlayers == 0) {
        await redis.sadd("chess:waiting", myWs.id);
      } else {
        const opponentPlayerId = await redis.spop("chess:waiting");

        const gameId = await gameSocketServer.createGame(
          ChessGame.generateInitialState(),
        );

        setTimeout(() => {
          myWs.sendMessage("gameId", { gameId });
        }, 500);

        gameSocketServer.sendMessageTo(opponentPlayerId!, "gameId", {
          gameId,
        });
      }
    } catch (_error) {
      myWs.sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
