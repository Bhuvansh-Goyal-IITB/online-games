import { moveDataSchema } from "@repo/socket-communication-schemas";
import { GameSocketServer } from "../../game-server.js";
import { MessageHandler, WebSocketWithInfo } from "../../types.js";
import { ChessGame } from "../../games/index.js";

export const moveHandler: (
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

    const safeParsedData = moveDataSchema.safeParse(data);

    if (!safeParsedData.success) {
      myWs.sendMessage("error", {
        message: "Invalid fields",
      });
      return;
    }

    const { gameId, move: moveString } = safeParsedData.data;

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

      const moves = game.state == "" ? [] : game.state.split(",");
      const timer = gameSocketServer.getTimer(gameId)!;

      if (moves.length % 2 == 0) {
        if (game.getPlayerColor(myWs.id) == "b") {
          myWs.sendMessage("error", {
            message: "Not your turn",
          });
          return;
        }

        try {
          await game.move(moveString);

          gameSocketServer.sendMessageTo(game.getPlayerId("b")!, "move", {
            move: moveString,
          });

          timer.tick(game.getPlayerId("b")!, gameSocketServer);
        } catch (error) {
          myWs.sendMessage("error", {
            message: "Invalid move",
          });
          return;
        }
      } else if (moves.length % 2 != 0) {
        if (game.getPlayerColor(myWs.id) == "w") {
          myWs.sendMessage("error", {
            message: "Not your turn",
          });
          return;
        }

        try {
          await game.move(moveString);

          gameSocketServer.sendMessageTo(game.getPlayerId("w")!, "move", {
            move: moveString,
          });

          timer.tick(game.getPlayerId("w")!, gameSocketServer);
        } catch (error) {
          myWs.sendMessage("error", {
            message: "Invalid move",
          });
          return;
        }
      }

      if (game.isFinished) {
        gameSocketServer.removeGame(gameId);
      }
    } catch (_error) {
      myWs.sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
