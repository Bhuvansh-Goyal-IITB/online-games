import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { Server } from "../server.js";
import { EventHandler, WebSocketWithInfo } from "../types.js";
import { getGame, removeGame } from "../redis.js";
import { GameObject } from "../game-object.js";

export const drawAcceptHandler: (server: Server) => EventHandler = (server) => {
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
      const opponentPlayerId = gameObject.getPlayerId(
        gameObject.getPlayerColor(id)! == "w" ? "b" : "w",
      )!;

      const timer = server.getTimer(gameId)!;
      timer.stop();
      server.removeTimer(gameId);
     
      server.sendMessage(ws, "draw accept");
      server.sendMessageTo(opponentPlayerId, "draw accept");

      await removeGame(gameId);
    } catch (error) {
      server.sendMessage(ws, "error", {
        message: "Something went wrong",
      });
    }
  };
};
