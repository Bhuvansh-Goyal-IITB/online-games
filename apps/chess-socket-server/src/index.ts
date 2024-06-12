import { createServer } from "http";
import { ChessSocketServer, WebSocketWithID } from "./ChessSocketServer";
import {
  authDataSchema,
  joinGameDataSchema,
  moveDataSchema,
} from "@repo/socket-communication-schemas";
import { db } from "./db";
import { usersTable } from "@repo/drizzle-schema";
import { eq } from "drizzle-orm";

const server = createServer();

const chessSocketServer = new ChessSocketServer({ server });

chessSocketServer.on("auth", async (ws, data) => {
  const safeParsedData = authDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        error: "Invalid fields",
      })
    );
    return;
  }

  const { id, isGuest } = safeParsedData.data;

  if (chessSocketServer.isIdConnected(id)) {
    return;
  }

  if (isGuest) {
    chessSocketServer.addUser(ws, id);
  } else {
    const dbResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    const user = dbResult.length == 1 ? dbResult[0] : null;

    if (!user) {
      ws.send(
        JSON.stringify({
          error: "User does not exist",
        })
      );
      return;
    }

    chessSocketServer.addUser(ws, id);
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
  const playerId = (ws as WebSocketWithID).id;

  const safeParsedData = joinGameDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        error: "Invalid fields",
      })
    );
    return;
  }

  const { gameId } = safeParsedData.data;

  try {
    chessSocketServer.joinGame(gameId, playerId);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        error: error.message,
      })
    );
  }
});

chessSocketServer.on("random game", (ws, _data) => {
  const playerId = (ws as WebSocketWithID).id;
  chessSocketServer.joinRandomGame(playerId);
});

chessSocketServer.on("move", (ws, data) => {
  const playerId = (ws as WebSocketWithID).id;

  const safeParsedData = moveDataSchema.safeParse(data);

  if (!safeParsedData.success) {
    ws.send(
      JSON.stringify({
        error: "Invalid fields",
      })
    );
    return;
  }

  const { gameId, move } = safeParsedData.data;

  try {
    chessSocketServer.move(gameId, playerId, move);
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        error: error.message,
      })
    );
  }
});
