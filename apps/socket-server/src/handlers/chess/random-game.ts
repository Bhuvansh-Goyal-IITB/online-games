import { GameSocketServer } from "../../game-server.js";
import { redis } from "../../redis.js";
import { MessageHandler } from "../../types.js";
import { ChessGame } from "../../games/index.js";

export const randomGameHandler: (
  gameSocketServer: GameSocketServer
) => MessageHandler = (gameSocketServer) => {
  return async (sendMessage, playerInfo, _data) => {
    try {
      const numWaitingPlayers = await redis.scard("chess:waiting");

      if (numWaitingPlayers == 0) {
        await redis.sadd("chess:waiting", playerInfo.id);
      } else {
        const opponentPlayerId = await redis.spop("chess:waiting");

        const gameId = await gameSocketServer.createGame(
          ChessGame.generateInitialState()
        );

        sendMessage("gameId", { gameId });

        gameSocketServer.sendMessageTo(opponentPlayerId!, "gameId", {
          gameId,
        });
      }
    } catch (_error) {
      sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
