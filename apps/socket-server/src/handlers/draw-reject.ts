import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { Server } from "../server.js";
import { EventHandler, WebSocketWithInfo } from "../types.js";
import { getGame } from "../redis.js";
import { GameObject } from "../game-object.js";

export const drawRejectHandler: (server: Server) => EventHandler = (server) => {
  return async (ws, data) => {
    const { id } = ws as WebSocketWithInfo;
    const safeParseData = gameIdDataSchema.safeParse(data);

    if (!safeParseData.success) {
      server.sendMessage(ws, "error", {
        message: "Invalid fields",
      });
      return;
    }

    const { gameId } = safeParseData.data;

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

      if (gameObject.getPlayerColor(id) == "w") {
        server.sendMessageTo(gameObject.getPlayerId("b")!, "draw reject");
      } else {
        server.sendMessageTo(gameObject.getPlayerId("w")!, "draw reject");
      }
    } catch (error) {
      server.sendMessage(ws, "error", {
        message: "Something went wrong",
      });
    }
  };
};
