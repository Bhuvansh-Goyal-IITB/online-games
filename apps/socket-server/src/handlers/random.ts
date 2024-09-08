import { Server } from "../server.js";
import { EventHandler, WebSocketWithInfo } from "../types.js";
import { createGame, redis } from "../redis.js";

export const randomHandler: (server: Server) => EventHandler = (server) => {
  return async (ws, _data) => {
    const { id, name, image } = ws as WebSocketWithInfo;
    const playerData = {
      id,
      name,
      image,
    };

    try {
      const numWaitingPlayers = await redis.scard("waiting");

      if (numWaitingPlayers == 0) {
        await redis.sadd("waiting", id);
      } else {
        const opponentPlayerId = (await redis.spop("waiting")) as string;
        const opponentData = server.getPlayerInfo(opponentPlayerId)!;

        const gameId = await createGame(playerData, opponentData);

        (ws as WebSocketWithInfo).gameId = gameId;
        server.sendMessage(ws, "gameId", {
          gameId,
        });

        server.setWsGameId(opponentPlayerId, gameId);
        server.sendMessageTo(opponentPlayerId, "gameId", {
          gameId,
        });
      }
    } catch (error) {
      server.sendMessage(ws, "error", {
        message: "Something went wrong",
      });
    }
  };
};
