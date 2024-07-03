import { authDataSchema } from "@repo/socket-communication-schemas";
import {
  GameSocketServer,
  sendMessageFunctionGenerator,
} from "../game-server.js";
import { WebSocket } from "ws";
import { getUserById } from "@repo/drizzle-db";

export const authHandler: (
  game: string,
  gameSocketServer: GameSocketServer
) => (ws: WebSocket, data: any) => void = (game, gameSocketServer) => {
  return async (ws, data) => {
    const safeParsedData = authDataSchema.safeParse(data);
    const sendMessage = sendMessageFunctionGenerator(ws);

    if (!safeParsedData.success) {
      sendMessage("error", {
        message: "Invalid fields",
      });
      return;
    }

    const { id, isGuest } = safeParsedData.data;

    if (gameSocketServer.isIdConnected(id)) {
      sendMessage("Authorized");
      return;
    }

    if (isGuest) {
      await gameSocketServer.addPlayer(ws, game, {
        id,
        name: `Guest${id.substring(0, 10)}`,
      });
      sendMessage("Authorized");
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

        await gameSocketServer.addPlayer(ws, game, {
          id,
          name: user.displayName,
          image: user.profileImageURL ?? undefined,
        });
        sendMessage("Authorized");
      } catch (error) {
        sendMessage("error", {
          message: "Something went wrong",
        });
        return;
      }
    }
  };
};
