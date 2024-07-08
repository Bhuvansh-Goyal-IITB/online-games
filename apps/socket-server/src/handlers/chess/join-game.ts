import { MessageHandler, WebSocketWithInfo } from "../../types.js";
import { gameIdDataSchema } from "@repo/socket-communication-schemas";
import { GameSocketServer } from "../../game-server.js";
import { ChessGame } from "../../games/index.js";
import { redis } from "../../redis.js";

export const joinGameHandler: (
  gameSocketServer: GameSocketServer,
) => MessageHandler = (gameSocketServer) => {
  return async (ws, data) => {
    const myWs = ws as WebSocketWithInfo;
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

      if (game.started) {
        if (!game.isPlayer(myWs.id)) {
          myWs.sendMessage("error", {
            message: "This game is already full",
          });
          return;
        }

        const timer = gameSocketServer.getTimer(gameId);

        if (timer) {
          timer.revertAbort(myWs.id, gameSocketServer);
        } else {
          await redis.publish(
            `timer:${gameId.substring(0, 6)}`,
            JSON.stringify({
              gameId,
              joiningPlayerId: myWs.id,
            }),
          );
        }

        if (game.state && game.state != "") {
          myWs.sendMessage("total moves", {
            moves: game.state,
          });
        }

        const color = game.getPlayerColor(myWs.id);
        const opponentData = game.getPlayerProfile(color == "w" ? "b" : "w");

        myWs.gameId = gameId;
        myWs.sendMessage("game started", {
          color,
          opponentData,
        });
        await redis.sadd(`${gameId}:joined`, myWs.id);
        return;
      }

      if (!game.isPlayer(myWs.id)) {
        await game.addPlayer(myWs);
      }

      const color = game.getPlayerColor(myWs.id);
      const whiteData = game.getPlayerProfile("w");
      const blackData = game.getPlayerProfile("b");

      const whiteId = game.getPlayerId("w")!;
      const blackId = game.getPlayerId("b")!;

      if (game.started) {
        myWs.sendMessage("game started", {
          color,
          opponentData: color == "w" ? blackData : whiteData,
        });

        gameSocketServer.sendMessageTo(
          color == "w" ? blackId : whiteId,
          "game started",
          {
            color: color == "w" ? "b" : "w",
            opponentData: color == "w" ? whiteData : blackData,
          },
        );

        const timer = gameSocketServer.createTimer(gameId, {
          [whiteId]: {
            playerTag: "w",
            timeInSec: 300,
          },
          [blackId]: {
            playerTag: "b",
            timeInSec: 300,
          },
        });

        timer.tick(whiteId, gameSocketServer);
        await redis.sadd(`${gameId}:joined`, myWs.id);
      } else {
        myWs.sendMessage("game joined", {
          color: color,
        });
        await redis.sadd(`${gameId}:joined`, myWs.id);
      }
    } catch (_error) {
      myWs.sendMessage("error", {
        message: "Something went wrong",
      });
    }
  };
};
