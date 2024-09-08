import { authDataSchema } from "@repo/socket-communication-schemas";
import { Server } from "../server.js";
import { EventHandler } from "../types.js";
import { getUserById } from "@repo/drizzle-db";

export const getAuthHandler: (server: Server) => EventHandler = (server) => {
  return async (ws, data) => {
    const safeParsedData = authDataSchema.safeParse(data);

    if (!safeParsedData.success) {
      server.sendMessage(ws, "error", {
        message: "Invalid fields",
      });
      return;
    }

    const { id, isGuest } = safeParsedData.data;

    if (server.isIdConnected(id)) {
      server.sendMessage(ws, "Authorized");
      return;
    }

    if (isGuest) {
      server.addPlayer(ws, {
        id,
        name: `Guest${id.substring(0, 10)}`,
      });

      server.sendMessage(ws, "Authorized");
      return;
    }

    try {
      const user = await getUserById(id);

      if (!user) {
        server.sendMessage(ws, "error", {
          message: "User does not exist",
        });
        return;
      }

      if (!user.displayName) {
        server.sendMessage(ws, "error", {
          message: "Please complete your profile (display name not set)",
        });
        return;
      }

      server.addPlayer(ws, {
        id,
        name: user.displayName,
        image: user.profileImageURL ?? undefined,
      });
      server.sendMessage(ws, "Authorized");
    } catch (error) {
      server.sendMessage(ws, "error", {
        message: "Something went wrong",
      });
    }
  };
};
