import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import { GameManager } from "./GameManager";

interface EventHandlers {
  [key: string]: (ws: WebSocket, data: any) => void;
}

export interface WebSocketWithID extends WebSocket {
  id: string;
}

export class ChessSocketServer {
  private wss: WebSocketServer;
  private eventHandlers: EventHandlers = {};
  private connectedUsers = new Map<string, WebSocket>();
  private gameManager = new GameManager();

  private waitingPlayerId: string | null = null;

  constructor(options?: ServerOptions) {
    this.wss = new WebSocketServer(options);

    this.wss.on("connection", (ws) => {
      ws.on("close", () => {
        const playerId = (ws as WebSocketWithID).id;

        if (this.waitingPlayerId == playerId) {
          this.waitingPlayerId = null;
        }

        this.connectedUsers.delete(playerId);
      });
      ws.on("message", (data) => {
        const parsedData = JSON.parse(data.toString());

        const event = parsedData.event;
        const eventData = parsedData.data;

        if (!event) return;

        if (event != "auth") {
          const playerId = (ws as WebSocketWithID).id;

          if (!playerId || !this.connectedUsers.get(playerId)) {
            ws.send(
              JSON.stringify({
                error: "Unauthorized",
              })
            );
          }
        }

        const eventHandler = this.eventHandlers[event];

        if (eventHandler) {
          eventHandler(ws, eventData);
        }
      });
    });
  }

  move(gameId: string, playerId: string, moveString: string) {
    this.gameManager.move(gameId, playerId, moveString, this);
  }

  joinGame(gameId: string, playerId: string) {
    this.gameManager.joinGame(gameId, playerId, this);
  }

  joinRandomGame(playerId: string) {
    if (!this.waitingPlayerId) {
      this.waitingPlayerId = playerId;
    } else {
      const gameId = this.createGame();

      this.sendMessageTo(
        this.waitingPlayerId,
        JSON.stringify({
          event: "gameId",
          data: {
            gameId,
          },
        })
      );

      this.sendMessageTo(
        playerId,
        JSON.stringify({
          event: "gameId",
          data: {
            gameId,
          },
        })
      );

      this.waitingPlayerId = null;
    }
  }

  createGame() {
    return this.gameManager.createGame();
  }

  sendMessageTo(id: string, message: string) {
    const socket = this.connectedUsers.get(id);

    if (socket) {
      socket.send(message);
    }
  }

  addUser(ws: WebSocket, id: string) {
    (ws as WebSocketWithID).id = id;
    this.connectedUsers.set(id, ws);
  }

  isIdConnected(id: string) {
    return this.connectedUsers.get(id) ? true : false;
  }

  on(event: string, eventHandler: (ws: WebSocket, data: any) => void) {
    this.eventHandlers[event] = eventHandler;
  }
}
