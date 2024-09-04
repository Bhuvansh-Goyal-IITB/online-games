import { moveDataSchema } from "@repo/socket-communication-schemas";
import { Server } from "../server.js";
import { EventHandler, WebSocketWithInfo } from "../types.js";
import { getGame, removeGame } from "../redis.js";
import { GameObject } from "../game-object.js";

export const moveHandler: (server: Server) => EventHandler = (server) => {
  return async (ws, data) => {
    const { id } = ws as WebSocketWithInfo;
    const safeParseData = moveDataSchema.safeParse(data);

    if (!safeParseData.success) {
      server.sendMessage(ws, "error", {
        message: "Invalid fields",
      });
      return;
    }

    const { gameId, move: moveString } = safeParseData.data;

    try {
      const redisData = await getGame(gameId);
      if (Object.keys(redisData).length == 0) {
        server.sendMessage(ws, "error", {
          message: "Game does not exist",
        });
        return;
      }

      const gameObject = new GameObject(gameId, redisData);

      if (!gameObject.isPlayer(id)) {
        server.sendMessage(ws, "error", {
          message: "You are not a player of this game",
        });
        return;
      }

      if (!gameObject.started) {
        server.sendMessage(ws, "error", {
          message: "Game has not started",
        });
        return;
      }

      const moves = gameObject.state == "" ? [] : gameObject.state.split(",");

      if (moves.length % 2 == 0) {
        if (gameObject.getPlayerColor(id) == "b") {
          server.sendMessage(ws, "error", {
            message: "Not your turn",
          });
          return;
        }

        try {
          await gameObject.move(moveString);

          server.sendMessageTo(gameObject.getPlayerId("b")!, "move", {
            move: moveString,
          });
        } catch (error) {
          server.sendMessage(ws, "error", {
            message: "Invalid move",
          });
          return;
        }
      } else {
        if (gameObject.getPlayerColor(id) == "w") {
          server.sendMessage(ws, "error", {
            message: "Not your turn",
          });
          return;
        }

        try {
          await gameObject.move(moveString);

          server.sendMessageTo(gameObject.getPlayerId("w")!, "move", {
            move: moveString,
          });
        } catch (error) {
          server.sendMessage(ws, "error", {
            message: "Invalid move",
          });
          return;
        }
      }

      if (gameObject.isFinished) {
        removeGame(gameId);
      }
    } catch (error) {
      server.sendMessage(ws, "error", {
        message: "Something went wrong",
      });
    }
  };
};
