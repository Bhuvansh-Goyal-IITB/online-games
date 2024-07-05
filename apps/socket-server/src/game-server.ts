import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import {
  PlayerInfo,
  RouteHandler,
  RouteHandlers,
  WebSocketWithInfo,
} from "./types.js";
import { redis, subscriber } from "./redis.js";
import { createId } from "@paralleldrive/cuid2";
import { authHandler } from "./handlers/auth.js";
import { GameTimer, PlayerTimeInfo } from "./game-timer.js";

export const sendMessageFunctionGenerator = (ws: WebSocket) => {
  return (event: string, data?: any) => {
    ws.send(JSON.stringify(payloadGenerator(event, data)));
  };
};

const payloadGenerator = (event: string, data?: any) => {
  const payload: { event: string; data?: any } = {
    event,
  };

  if (data) payload["data"] = data;
  return payload;
};

export class GameSocketServer {
  private wss: WebSocketServer;
  private routeHandlers: RouteHandlers = {};
  private connectedUsers = new Map<string, WebSocket>();
  private gameTimers: GameTimer[] = [];

  constructor(options?: ServerOptions) {
    this.wss = new WebSocketServer(options);

    this.wss.on("connection", (ws) => {
      ws.on("close", async () => {
        const { id, game } = ws as WebSocketWithInfo & { game: string };

        const result = this.connectedUsers.delete(id);
        if (result) {
          const promises = [
            redis.srem(`${game}:waiting`, id),
            subscriber.unsubscribe(id),
          ];
          await Promise.all(promises);
        }
      });

      ws.on("message", async (payload) => {
        const { event, data } = JSON.parse(payload.toString());
        const { id, name, image } = ws as WebSocketWithInfo;

        if (!event || typeof event != "string") return;

        const [game, action] = event.split(":");

        if (!game || typeof game != "string") return;
        if (!action || typeof action != "string") return;

        if (action == "auth") {
          authHandler(game, this)(ws, data);
        } else {
          const { game: authGame } = ws as WebSocket & { game: string };
          if (!id || !this.connectedUsers.get(id) || game != authGame) {
            sendMessageFunctionGenerator(ws)("error", {
              message: "Unauthorized",
            });
            return;
          }
        }

        const routeHandler = this.routeHandlers[game];

        const messageHandler = routeHandler?.(action);

        if (messageHandler) {
          await messageHandler(
            (event: string, data?: any) => {
              ws.send(JSON.stringify(payloadGenerator(event, data)));
            },
            { id, name, image },
            data,
          );
        }
      });
    });

    subscriber.on("message", async (channel, message) => {
      this.connectedUsers.get(channel)?.send(message);
    });
  }

  async sendMessageTo(id: string, event: string, data?: any) {
    const ws = this.connectedUsers.get(id);

    if (ws) {
      sendMessageFunctionGenerator(ws)(event, data);
    } else {
      await redis.publish(id, JSON.stringify(payloadGenerator(event, data)));
    }
  }

  createTimer(
    gameId: string,
    startPlayerId: string,
    initialInfo: PlayerTimeInfo,
  ) {
    const newTimer = new GameTimer(gameId, initialInfo, startPlayerId, this);
    this.gameTimers.push(newTimer);
    return newTimer;
  }

  async removeTimer(gameId: string) {
    this.gameTimers = this.gameTimers.filter((timer) => timer.gameId != gameId);
    await redis.del(gameId);
  }

  getTimer(gameId: string) {
    return this.gameTimers.find((timer) => timer.gameId == gameId);
  }

  on(game: string, handler: RouteHandler) {
    this.routeHandlers[game] = handler;
  }

  getGame(gameId: string) {
    return redis.hgetall(gameId);
  }

  async createGame(initialState: Record<string, string>) {
    const gameId = createId();
    await redis.hset(gameId, initialState);
    return gameId;
  }

  removeGame(gameId: string) {
    return redis.del(gameId);
  }

  isIdConnected(id: string) {
    return this.connectedUsers.has(id);
  }

  async addPlayer(ws: WebSocket, game: string, playerInfo: PlayerInfo) {
    (ws as WebSocketWithInfo).id = playerInfo.id;
    (ws as WebSocketWithInfo).name = playerInfo.name;
    (ws as WebSocketWithInfo).image = playerInfo.image;
    (ws as WebSocketWithInfo).game = game;
    this.connectedUsers.set(playerInfo.id, ws);

    await subscriber.subscribe(playerInfo.id);
  }
}
