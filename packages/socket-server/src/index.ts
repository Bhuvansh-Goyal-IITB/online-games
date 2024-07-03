import { ServerOptions, WebSocket, WebSocketServer } from "ws";
import { getUserById } from "@repo/drizzle-db";
import { authDataSchema } from "@repo/socket-communication-schemas";

interface MessageHandlers {
  [key: string]: MessageHandler;
}

export type MessageHandler = (
  sendMessage: (event: string, data?: any) => void,
  playerInfo: PlayerInfo,
  data: any
) => Promise<void> | void;

export type PlayerInfo = {
  id: string;
  name: string;
  image?: string;
};

type WebSocketWithInfo = WebSocket & PlayerInfo;

const sendMessageFunctionGenerator = (ws: WebSocket) => {
  return (event: string, data?: any) => {
    const payload: { event: string; data?: any } = {
      event,
    };

    if (data) payload["data"] = data;
    ws.send(JSON.stringify(payload));
  };
};

export class GameSocketServer {
  private wss: WebSocketServer;
  private connectedUsers = new Map<string, WebSocket>();
  private messageHandlers: MessageHandlers = {};
  protected closeHandler: ((playerInfo: PlayerInfo) => void) | null = null;

  constructor(options?: ServerOptions) {
    this.wss = new WebSocketServer(options);

    this.wss.on("connection", (ws) => {
      ws.on("close", () => {
        const { id, name, image } = ws as WebSocketWithInfo;
        if (this.closeHandler) this.closeHandler({ id, name, image });
        this.connectedUsers.delete(id);
      });

      ws.on("message", async (payload) => {
        const { event, data } = JSON.parse(payload.toString());
        const { id, name, image } = ws as WebSocketWithInfo;

        if (!event || typeof event != "string") return;

        if (event == "auth") {
          this.onAuth(ws, data);
        } else {
          if (!id || !this.connectedUsers.get(id)) {
            sendMessageFunctionGenerator(ws)("error", {
              message: "Unauthorized",
            });
            return;
          }
        }

        const messageHandler = this.messageHandlers[event];

        if (messageHandler) {
          await messageHandler(
            sendMessageFunctionGenerator(ws),
            { id, name, image },
            data
          );
        }
      });
    });
  }

  sendMessageTo(id: string, event: string, data?: any) {
    const ws = this.connectedUsers.get(id);

    if (ws) {
      sendMessageFunctionGenerator(ws)(event, data);
    }
  }

  protected on(event: string, handler: MessageHandler) {
    this.messageHandlers[event] = handler;
  }

  private isIdConnected(id: string) {
    return this.connectedUsers.has(id);
  }

  private addPlayer(ws: WebSocket, playerInfo: PlayerInfo) {
    (ws as WebSocketWithInfo).id = playerInfo.id;
    (ws as WebSocketWithInfo).name = playerInfo.name;
    (ws as WebSocketWithInfo).image = playerInfo.image;
    this.connectedUsers.set(playerInfo.id, ws);
  }

  private async onAuth(ws: WebSocket, data: any) {
    const safeParsedData = authDataSchema.safeParse(data);
    const sendMessage = sendMessageFunctionGenerator(ws);

    if (!safeParsedData.success) {
      sendMessage("error", {
        message: "Invalid fields",
      });
      return;
    }

    const { id, isGuest } = safeParsedData.data;

    if (this.isIdConnected(id)) {
      // sendMessage("Authorized");
      return;
    }

    if (isGuest) {
      this.addPlayer(ws, { id, name: `Guest${id.substring(0, 10)}` });
      // sendMessage("Authorized");
    } else {
      try {
        const user = await getUserById(id);

        if (!user) {
          sendMessage("error", {
            message: "User does not exist",
          });
          return;
        }

        if (!user.displayName) {
          sendMessage("error", {
            message: "Please complete your profile (display name not set)",
          });
          return;
        }
        this.addPlayer(ws, {
          id,
          name: user.displayName,
          image: user.profileImageURL ?? undefined,
        });
        // sendMessage("Authorized");
      } catch (error) {
        sendMessage("error", {
          message: "Something went wrong",
        });
        return;
      }
    }
  }
}
