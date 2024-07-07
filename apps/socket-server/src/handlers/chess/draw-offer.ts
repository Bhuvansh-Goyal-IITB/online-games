import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { GameSocketServer } from "../../game-server.js";
import { MessageHandler, WebSocketWithInfo } from "../../types.js";
import { ChessGame } from "../../games/index.js";

export const drawOfferHandler: (
  gameSocketServer: GameSocketServer,
) => MessageHandler = (gameSocketServer) => {
  return async (ws, data) => {
    const myWs = ws as WebSocketWithInfo;
    if (!myWs.gameId) {
      myWs.sendMessage("error", {
        message: "Please join the game first",
      });
      return;
    }
    const safeParsedData = gameIdDataSchema.safeParse(data);

    if (!safeParsedData.success) {
      myWs.sendMessage("error", {
        message: "Invalid fields",
      });
      return;
    }

    const { gameId } = safeParsedData.data;

    try {
      const redisRecord = await gameSocketServer.getGame(gameId);

      if (Object.keys(redisRecord).length == 0) {
        myWs.sendMessage("error", {
          message: "Game does not exist",
        });
        return;
      }

      const game = new ChessGame(gameId, redisRecord);

      if (!game.isPlayer(myWs.id)) {
        myWs.sendMessage("error", {
          message: "You are not a player of this game",
        });
        return;
      }

      if (!game.started) {
        myWs.sendMessage("error", {
          message: "Game has not started",
        });
        return;
      }

      if (game.getPlayerColor(myWs.id) == "w") {
        gameSocketServer.sendMessageTo(game.getPlayerId("b")!, "draw offer");
      } else {
        gameSocketServer.sendMessageTo(game.getPlayerId("w")!, "draw offer");
      }
    } catch (_error) {
      myWs.sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
