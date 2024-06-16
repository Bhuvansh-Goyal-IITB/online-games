import { createServer } from "http";
import {
  ChessSocketServer,
  WebSocketWithDetails,
} from "./chess-socket-server.js";
import {
  authDataSchema,
  joinGameDataSchema,
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
    return;
  }

  if (isGuest) {
    chessSocketServer.addUser(ws, id, `Guest${id.substring(0, 10)}`);
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
  const safeParsedData = joinGameDataSchema.safeParse(data);

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

  const { move } = safeParsedData.data;

  try {
    chessSocketServer.move(ws as WebSocketWithDetails, move);
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

chessSocketServer.on("resign", (ws, _data) => {
  try {
    chessSocketServer.resign(ws as WebSocketWithDetails);
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

chessSocketServer.on("draw offer", (ws, _data) => {
  try {
    chessSocketServer.sendDrawOffer(ws as WebSocketWithDetails);
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

chessSocketServer.on("draw reject", (ws, _data) => {
  try {
    chessSocketServer.rejectDrawOffer(ws as WebSocketWithDetails);
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

chessSocketServer.on("draw accept", (ws, _data) => {
  try {
    chessSocketServer.draw(ws as WebSocketWithDetails);
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
