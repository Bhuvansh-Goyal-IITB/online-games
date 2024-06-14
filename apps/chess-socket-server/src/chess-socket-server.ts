import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import { GameManager } from "./game-manager.js";

interface EventHandlers {
  [key: string]: (ws: WebSocket, data: any) => void;
}

export interface WebSocketWithDetails extends WebSocket {
  id: string;
  playerName: string;
  playerProfileImage?: string;
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
        const playerId = (ws as WebSocketWithDetails).id;

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
          const playerId = (ws as WebSocketWithDetails).id;

          if (!playerId || !this.connectedUsers.get(playerId)) {
            ws.send(
              JSON.stringify({
                error: "Unauthorized",
              })
            );
            return;
          }
        }

        const eventHandler = this.eventHandlers[event];

        if (eventHandler) {
          eventHandler(ws, eventData);
        }
      });
    });
  }

  move(gameId: string, ws: WebSocketWithDetails, moveString: string) {
    this.gameManager.move(gameId, ws, moveString, this);
  }

  joinGame(gameId: string, ws: WebSocketWithDetails) {
    this.gameManager.joinGame(gameId, ws, this);
  }

  joinRandomGame(ws: WebSocketWithDetails) {
    const playerId = ws.id;
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

  addUser(
    ws: WebSocket,
    id: string,
    playerName: string,
    playerProfileImage?: string
  ) {
    (ws as WebSocketWithDetails).id = id;
    (ws as WebSocketWithDetails).playerName = playerName;
    (ws as WebSocketWithDetails).playerProfileImage = playerProfileImage;
    this.connectedUsers.set(id, ws);
  }

  isIdConnected(id: string) {
    return this.connectedUsers.get(id) ? true : false;
  }

  on(event: string, eventHandler: (ws: WebSocket, data: any) => void) {
    this.eventHandlers[event] = eventHandler;
  }
}
