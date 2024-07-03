import { moveDataSchema } from "@repo/socket-communication-schemas";
import { GameSocketServer } from "../../game-server.js";
import { MessageHandler } from "../../types.js";
import { ChessGame } from "../../games/index.js";

export const moveHandler: (
  gameSocketServer: GameSocketServer
) => MessageHandler = (gameSocketServer) => {
  return async (sendMessage, playerInfo, data) => {
    const safeParsedData = moveDataSchema.safeParse(data);

    if (!safeParsedData.success) {
      sendMessage("error", {
        message: "Invalid fields",
      });
      return;
    }

    const { gameId, move: moveString } = safeParsedData.data;

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

      const moves = game.state == "" ? [] : game.state.split(",");

      if (moves.length % 2 == 0) {
        if (game.getPlayerColor(playerInfo.id) == "b") {
          sendMessage("error", {
            message: "Not your turn",
          });
          return;
        }

        try {
          await game.move(moveString);

          gameSocketServer.sendMessageTo(game.getPlayerId("b")!, "move", {
            move: moveString,
          });
        } catch (error) {
          sendMessage("error", {
            message: "Invalid move",
          });
          return;
        }
      } else if (moves.length % 2 != 0) {
        if (game.getPlayerColor(playerInfo.id) == "w") {
          sendMessage("error", {
            message: "Not your turn",
          });
          return;
        }

        try {
          await game.move(moveString);

          gameSocketServer.sendMessageTo(game.getPlayerId("w")!, "move", {
            move: moveString,
          });
        } catch (error) {
          sendMessage("error", {
            message: "Invalid move",
          });
          return;
        }
      }

      if (game.isFinished) {
        gameSocketServer.removeGame(gameId);
      }
    } catch (_error) {
      sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
