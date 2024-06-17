import { createServer } from "http";
import {
  ChessSocketServer,
  WebSocketWithDetails,
} from "./chess-socket-server.js";
import {
  authDataSchema,
  gameIdDataSchema,
  moveDataSchema,
} from "@repo/socket-communication-schemas";
import { db } from "./db/index.js";
import { usersTable } from "./db/schema/index.js";
import { eq } from "drizzle-orm";

const server = createServer();
const port = process.env.PORT || 3000;

const chessSocketServer = new ChessSocketServer({ server });

chessSocketServer.on("auth", async (ws, data) => {
  const safeParsedData = authDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: "Invalid fields",
        },
      })
    );
    return;
  }

  const { id, isGuest } = safeParsedData.data;

  if (chessSocketServer.isIdConnected(id)) {
    chessSocketServer.sendMessageTo(
      id,
      JSON.stringify({
        event: "Authorized",
      })
    );
    return;
  }

  if (isGuest) {
    chessSocketServer.addUser(ws, id, `Guest${id.substring(0, 10)}`);
    chessSocketServer.sendMessageTo(
      id,
      JSON.stringify({
        event: "Authorized",
      })
    );
  } else {
    const dbResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    const user = dbResult.length == 1 ? dbResult[0] : null;

    if (!user) {
      ws.send(
        JSON.stringify({
          event: "error",
          data: {
            message: "User does not exist",
          },
        })
      );
      return;
    }

    if (!user.displayName) {
      ws.send(
        JSON.stringify({
          event: "error",
          data: {
            message: "Please complete your profile (display name not set)",
          },
        })
      );
      return;
    }
    chessSocketServer.addUser(
      ws,
      id,
      user.displayName,
      user.profileImageURL ?? undefined
    );
    chessSocketServer.sendMessageTo(
      id,
      JSON.stringify({
        event: "Authorized",
      })
    );
  }
});

chessSocketServer.on("create game", (ws, data) => {
  const gameId = chessSocketServer.createGame();

  ws.send(
    JSON.stringify({
      event: "gameId",
      data: { gameId },
    })
  );
});

chessSocketServer.on("join game", (ws, data) => {
  const safeParsedData = gameIdDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: "Invalid fields",
        },
      })
    );
    return;
  }

  const { gameId } = safeParsedData.data;

  try {
    chessSocketServer.joinGame(gameId, ws as WebSocketWithDetails);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: error.message,
        },
      })
    );
  }
});

chessSocketServer.on("random game", (ws, _data) => {
  chessSocketServer.joinRandomGame(ws as WebSocketWithDetails);
});

chessSocketServer.on("move", (ws, data) => {
  const safeParsedData = moveDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: "Invalid fields",
        },
      })
    );
    return;
  }

  const { gameId, move } = safeParsedData.data;

  try {
    chessSocketServer.move(gameId, ws as WebSocketWithDetails, move);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: error.message,
        },
      })
    );
  }
});

chessSocketServer.on("resign", (ws, data) => {
  const safeParsedData = gameIdDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: "Invalid fields",
        },
      })
    );
    return;
  }

  const { gameId } = safeParsedData.data;

  try {
    chessSocketServer.resign(gameId, ws as WebSocketWithDetails);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: error.message,
        },
      })
    );
  }
});

chessSocketServer.on("draw offer", (ws, data) => {
  const safeParsedData = gameIdDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: "Invalid fields",
        },
      })
    );
    return;
  }

  const { gameId } = safeParsedData.data;

  try {
    chessSocketServer.sendDrawOffer(gameId, ws as WebSocketWithDetails);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: error.message,
        },
      })
    );
  }
});

chessSocketServer.on("draw reject", (ws, data) => {
  const safeParsedData = gameIdDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: "Invalid fields",
        },
      })
    );
    return;
  }

  const { gameId } = safeParsedData.data;

  try {
    chessSocketServer.rejectDrawOffer(gameId, ws as WebSocketWithDetails);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: error.message,
        },
      })
    );
  }
});

chessSocketServer.on("draw accept", (ws, data) => {
  const safeParsedData = gameIdDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: "Invalid fields",
        },
      })
    );
    return;
  }

  const { gameId } = safeParsedData.data;

  try {
    chessSocketServer.draw(gameId, ws as WebSocketWithDetails);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message: error.message,
        },
      })
    );
  }
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
