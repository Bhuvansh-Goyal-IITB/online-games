import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { GameSocketServer } from "../../game-server.js";
import { MessageHandler } from "../../types.js";
import { ChessGame } from "../../games/index.js";

export const drawAcceptHandler: (
  gameSocketServer: GameSocketServer
) => MessageHandler = (gameSocketServer) => {
  return async (sendMessage, playerInfo, data) => {
    const safeParsedData = gameIdDataSchema.safeParse(data);

    if (!safeParsedData.success) {
      sendMessage("error", {
        message: "Invalid fields",
      });
      return;
    }

    const { gameId } = safeParsedData.data;

    try {
      const redisRecord = await gameSocketServer.getGame(gameId);

      if (Object.keys(redisRecord).length == 0) {
        sendMessage("error", {
          message: "Game does not exist",
        });
        return;
      }

      const game = new ChessGame(gameId, redisRecord);

      if (!game.isPlayer(playerInfo.id)) {
        sendMessage("error", {
          message: "You are not a player of this game",
        });
        return;
      }

      if (!game.started) {
        sendMessage("error", {
          message: "Game has not started",
        });
        return;
      }

      const opponentPlayerId = game.getPlayerId(
        game.getPlayerColor(playerInfo.id)! == "w" ? "b" : "w"
      )!;

      sendMessage("draw accept");
      gameSocketServer.sendMessageTo(opponentPlayerId, "draw accept");

      gameSocketServer.removeGame(gameId);
    } catch (_error) {
      sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
