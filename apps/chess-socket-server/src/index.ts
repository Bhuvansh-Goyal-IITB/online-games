import { WebSocket, WebSocketServer } from "ws";
import { nanoid } from "nanoid";
import { createServer } from "http";

const port = 3002;

const server = createServer();

const wss = new WebSocketServer({ server });

const connectedUsers = new Map<string, WebSocket>();

let waitingPlayerId: string | null = null;

interface WebSocketWithID extends WebSocket {
  playerId: string;
}

interface Game {
  gameId: string;
  whiteId: string;
  blackId: string;
  moves: string[];
  completed: boolean;
}

const games: Game[] = [];

wss.on("connection", (ws) => {
  ws.on("close", () => {
    const playerId = (ws as WebSocketWithID).playerId;

    const game = games.find(
      (game) => game.blackId == playerId || game.whiteId == playerId
    );

    if (game) {
      if (game.blackId == playerId) {
        const whiteSocket = connectedUsers.get(game.whiteId);
        if (whiteSocket) {
          whiteSocket.send(
            JSON.stringify({
              event: "opponent disconnected",
            })
          );
        }
      } else {
        const blackSocket = connectedUsers.get(game.blackId);
        if (blackSocket) {
          blackSocket.send(
            JSON.stringify({
              event: "opponent disconnected",
            })
          );
        }
      }
    }

    if (waitingPlayerId == playerId) {
      waitingPlayerId = null;
    }

    connectedUsers.delete((ws as WebSocketWithID).playerId);
  });

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.event == "connect") {
      const { playerId } = parsedData.data;

      if (!playerId) {
        const id = nanoid();

        (ws as WebSocketWithID).playerId = id;

        ws.send(
          JSON.stringify({
            event: "id",
            data: {
              id,
            },
          })
        );

        connectedUsers.set(id, ws);
        return;
      }

      (ws as WebSocketWithID).playerId = playerId;
      connectedUsers.set(playerId, ws);
    } else if (parsedData.event == "create game") {
      const playerId = (ws as WebSocketWithID).playerId;
      if (!playerId) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "WebSocket does no have an id",
            },
          })
        );

        return;
      }

      const gameId = nanoid(6);
      games.push({
        gameId,
        whiteId: "",
        blackId: "",
        moves: [],
        completed: false,
      });

      ws.send(
        JSON.stringify({
          event: "gameId",
          data: {
            gameId,
          },
        })
      );
    } else if (parsedData.event == "join game") {
      const playerId = (ws as WebSocketWithID).playerId;
      if (!playerId) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "WebSocket does no have an id",
            },
          })
        );
        return;
      }

      const { gameId } = parsedData.data;

      if (!gameId) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "No game id provided",
            },
          })
        );
        return;
      }

      const game = games.find((game) => game.gameId == gameId);

      if (!game) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "Game does not exist",
            },
          })
        );
        return;
      }

      if (!game.whiteId && !game.blackId) {
        if (Math.random() > 0.5) {
          game.whiteId = playerId;
        } else {
          game.blackId = playerId;
        }
      } else if (!game.whiteId) {
        game.whiteId = playerId;

        const blackSocket = connectedUsers.get(game.blackId);
        if (blackSocket) {
          blackSocket.send(
            JSON.stringify({
              event: "game started",
              data: {
                color: "b",
              },
            })
          );
          ws.send(
            JSON.stringify({
              event: "game started",
              data: {
                color: "w",
              },
            })
          );
        }
      } else if (!game.blackId) {
        game.blackId = playerId;
        const whiteSocket = connectedUsers.get(game.whiteId);
        if (whiteSocket) {
          whiteSocket.send(
            JSON.stringify({
              event: "game started",
              data: {
                color: "w",
              },
            })
          );
          ws.send(
            JSON.stringify({
              event: "game started",
              data: {
                color: "b",
              },
            })
          );
        }
      } else {
        if (playerId == game.blackId) {
          ws.send(
            JSON.stringify({
              event: "total moves",
              data: {
                moves: game.moves.join(","),
              },
            })
          );
          ws.send(
            JSON.stringify({
              event: "game started",
              data: {
                color: "b",
              },
            })
          );

          const whiteSocket = connectedUsers.get(game.whiteId);
          if (whiteSocket) {
            whiteSocket.send(
              JSON.stringify({
                event: "opponent connected",
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                event: "opponent disconnected",
              })
            );
          }
        } else if (playerId == game.whiteId) {
          ws.send(
            JSON.stringify({
              event: "total moves",
              data: {
                moves: game.moves.join(","),
              },
            })
          );
          ws.send(
            JSON.stringify({
              event: "game started",
              data: {
                color: "w",
              },
            })
          );
          const blackSocket = connectedUsers.get(game.blackId);
          if (blackSocket) {
            blackSocket.send(
              JSON.stringify({
                event: "opponent connected",
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                event: "opponent disconnected",
              })
            );
          }
        } else {
          ws.send(
            JSON.stringify({
              event: "error",
              data: {
                error: "The game is already full",
              },
            })
          );
        }
      }
    } else if (parsedData.event == "random game") {
      const playerId = (ws as WebSocketWithID).playerId;
      if (!playerId) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "WebSocket does no have an id",
            },
          })
        );
        return;
      }

      if (waitingPlayerId) {
        const gameId = nanoid(6);

        const whiteId = Math.random() > 0.5 ? playerId : waitingPlayerId;
        const blackId = whiteId == playerId ? waitingPlayerId : playerId;

        const newGame: Game = {
          gameId,
          whiteId,
          blackId,
          moves: [],
          completed: false,
        };
        games.push(newGame);

        connectedUsers.get(whiteId)?.send(
          JSON.stringify({
            event: "gameId",
            data: {
              gameId,
            },
          })
        );
        connectedUsers.get(blackId)?.send(
          JSON.stringify({
            event: "gameId",
            data: {
              gameId,
            },
          })
        );

        waitingPlayerId = null;
      } else {
        waitingPlayerId = playerId;
      }
    } else if (parsedData.event == "move") {
      const playerId = (ws as WebSocketWithID).playerId;
      if (!playerId) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "WebSocket does no have an id",
            },
          })
        );
        return;
      }

      const { gameId, move } = parsedData.data;

      if (!gameId || !move) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "No game id or move provided",
            },
          })
        );
        return;
      }

      const game = games.find((game) => game.gameId == gameId);

      if (!game) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "Game does not exist",
            },
          })
        );
        return;
      }

      if (game && game.blackId != playerId && game.whiteId != playerId) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: {
              error: "You are not a player of this game",
            },
          })
        );
        return;
      }

      if (game.moves.length % 2 == 0 && playerId == game.whiteId) {
        game.moves.push(move);

        const blackSocket = connectedUsers.get(game.blackId);
        if (blackSocket) {
          blackSocket.send(
            JSON.stringify({
              event: "move",
              data: {
                move,
              },
            })
          );
        }
      } else if (game.moves.length % 2 != 0 && playerId == game.blackId) {
        game.moves.push(move);

        const whiteSocket = connectedUsers.get(game.whiteId);
        if (whiteSocket) {
          whiteSocket.send(
            JSON.stringify({
              event: "move",
              data: {
                move,
              },
            })
          );
        }
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
