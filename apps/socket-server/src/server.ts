import { WebSocket } from "ws";
import { ServerOptions, WebSocketServer } from "ws";
import { PlayerInfo, WebSocketWithInfo } from "./types.js";
import { getAuthHandler } from "./handlers/auth.js";
import { getEventHandler } from "./handlers/index.js";

export class Server {
  private wss: WebSocketServer;
  private connectedUsers = new Map<string, WebSocket>();

  constructor(options?: ServerOptions) {
    this.wss = new WebSocketServer(options);

    this.wss.on("connection", (ws) => {
      ws.on("close", async () => {
        const { id } = ws as WebSocketWithInfo;
        this.connectedUsers.delete(id);
      });
      ws.on("message", async (payload) => {
        const { event, data } = JSON.parse(payload.toString()) as {
          event: string;
          data?: string;
        };

        if (!event || typeof event != "string") return;

        const { id } = ws as WebSocketWithInfo;

        if (event == "auth") {
          const authHander = getAuthHandler(this);
          await authHander(ws, data);
          return;
        } else if (!id || !this.connectedUsers.has(id)) {
          console.log(id);
          this.sendMessage(ws, "error", {
            message: "Unauthorized",
          });
          return;
        }

        const eventHandler = getEventHandler(this, event);
        if (eventHandler) {
          await eventHandler(ws, data);
        }
      });
    });
  }

  sendMessage(ws: WebSocket, event: string, data?: any) {
    const payload: { event: string; data?: any } = {
      event,
    };
    if (data) payload["data"] = data;
    ws.send(JSON.stringify(payload));
  }

  sendMessageTo(playerId: string, event: string, data?: any) {
    const payload: { event: string; data?: any } = {
      event,
    };
    if (data) payload["data"] = data;
    this.connectedUsers.get(playerId)?.send(JSON.stringify(payload));
  }

  getPlayerInfo(playerId: string) {
    const playerWs = this.connectedUsers.get(playerId);

    if (playerWs) {
      const { id, name, image } = playerWs as WebSocketWithInfo;
      return { id, name, image };
    } else {
      return undefined;
    }
  }

  isIdConnected(id: string) {
    return this.connectedUsers.has(id);
  }

  addPlayer(ws: WebSocket, { id, name, image }: PlayerInfo) {
    const myWs = ws as WebSocketWithInfo;
    myWs.id = id;
    myWs.name = name;
    myWs.image = image;

    this.connectedUsers.set(id, ws);
  }
}