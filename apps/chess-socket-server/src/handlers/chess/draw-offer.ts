import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { GameSocketServer } from "../../game-server.js";
import { MessageHandler } from "../../types.js";
import { ChessGame } from "../../games/index.js";

export const drawOfferHandler: (
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

      if (game.getPlayerColor(playerInfo.id) == "w") {
        gameSocketServer.sendMessageTo(game.getPlayerId("b")!, "draw offer");
      } else {
        gameSocketServer.sendMessageTo(game.getPlayerId("w")!, "draw offer");
      }
    } catch (_error) {
      sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
