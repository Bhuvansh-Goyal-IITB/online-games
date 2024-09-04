import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { Server } from "../server.js";
import { EventHandler, WebSocketWithInfo } from "../types.js";
import { getGame } from "../redis.js";
import { GameObject } from "../game-object.js";

export const joinHandler: (server: Server) => EventHandler = (server) => {
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

      if (gameObject.started) {
        if (!gameObject.isPlayer(id)) {
          server.sendMessage(ws, "error", {
            message: "This game is already full",
          });
          return;
        }

        if (gameObject.state && gameObject.state != "") {
          server.sendMessage(ws, "total moves", {
            moves: gameObject.state,
          });
        }

        const color = gameObject.getPlayerColor(id);
        const opponentData = gameObject.getPlayerProfile(
          color == "w" ? "b" : "w",
        );

        server.sendMessage(ws, "game started", {
          color,
          opponentData,
        });
        return;
      }

      if (!gameObject.isPlayer(id)) {
        await gameObject.addPlayer(ws);
      }

      if (gameObject.isFull && !gameObject.started) {
        // start the timer here
        gameObject.startGame();
      }

      const color = gameObject.getPlayerColor(id);
      const whiteData = gameObject.getPlayerProfile("w");
      const blackData = gameObject.getPlayerProfile("b");

      const whiteId = gameObject.getPlayerId("w")!;
      const blackId = gameObject.getPlayerId("b")!;

      if (gameObject.started) {
        server.sendMessage(ws, "game started", {
          color,
          opponentData: color == "w" ? blackData : whiteData,
        });

        server.sendMessageTo(color == "w" ? blackId : whiteId, "game started", {
          color: color == "w" ? "b" : "w",
          opponentData: color == "w" ? whiteData : blackData,
        });
      } else {
        server.sendMessage(ws, "game joined", {
          color,
        });
      }
    } catch (error) {
      server.sendMessage(ws, "error", {
        message: "Something went wrong",
      });
    }
  };
};
