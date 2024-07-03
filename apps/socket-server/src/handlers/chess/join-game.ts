import { MessageHandler } from "../../types.js";
import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { GameSocketServer } from "../../game-server.js";
import { ChessGame } from "../../games/index.js";

export const joinGameHandler: (
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

      if (game.started) {
        if (!game.isPlayer(playerInfo.id)) {
          sendMessage("error", {
            message: "This game is already full",
          });
          return;
        }

        if (game.state && game.state != "") {
          sendMessage("total moves", {
            moves: game.state,
          });
        }

        const color = game.getPlayerColor(playerInfo.id);
        const opponentData = game.getPlayerProfile(color == "w" ? "b" : "w");

        sendMessage("game started", {
          color,
          opponentData,
        });
        return;
      }

      if (!game.isPlayer(playerInfo.id)) {
        await game.addPlayer(playerInfo.id, playerInfo.name, playerInfo.image);
      }

      const color = game.getPlayerColor(playerInfo.id);
      const whiteData = game.getPlayerProfile("w");
      const blackData = game.getPlayerProfile("b");

      if (game.started) {
        sendMessage("game started", {
          color,
          opponentData: color == "w" ? blackData : whiteData,
        });

        gameSocketServer.sendMessageTo(
          game.getPlayerId(color == "w" ? "b" : "w")!,
          "game started",
          {
            color: color == "w" ? "b" : "w",
            opponentData: color == "w" ? whiteData : blackData,
          }
        );
      } else {
        sendMessage("game joined", {
          color: color,
        });
      }
    } catch (_error) {
      sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
