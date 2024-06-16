import {
  ChessSocketServer,
  WebSocketWithDetails,
} from "./chess-socket-server.js";
import { Game } from "./game.js";

export class GameManager {
  private games: Game[] = [];

  getGame(gameId: string) {
    const game = this.games.find((game) => game.gameId == gameId);

    if (!game) {
      throw Error("Game does not exist");
    }

    return game;
  }

  getGameByPlayerId(playerId: string) {
    const game = this.games.find(
      (game) => game.whiteId == playerId || game.blackId == playerId
    );

    if (!game) {
      throw Error("Game does not exist, or is finished, or is full");
    }

    return game;
  }

  removeGame(gameId: string) {
    this.games = this.games.filter((game) => game.gameId != gameId);
  }

  createGame() {
    const newGame = new Game();
    this.games.push(newGame);
    return newGame.gameId;
  }

  joinGame(
    gameId: string,
    ws: WebSocketWithDetails,
    chessSocketServer: ChessSocketServer
  ) {
    const playerId = ws.id;

    const game = this.getGame(gameId);

    if (game.gameStarted) {
      if (game.whiteId != playerId && game.blackId != playerId) {
        throw Error("The game is already full");
      }

      if (game.moves.length > 0) {
        chessSocketServer.sendMessageTo(
          playerId,
          JSON.stringify({
            event: "total moves",
            data: {
              moves: game.moves.join(","),
            },
          })
        );
      }

      chessSocketServer.sendMessageTo(
        playerId,
        JSON.stringify({
          event: "game started",
          data: {
            color: game.whiteId == playerId ? "w" : "b",
            opponentData:
              game.whiteId == playerId
                ? {
                    name: game.blackPlayerName,
                    image: game.blackPlayerProfileImg,
                  }
                : {
                    name: game.whitePlayerName,
                    image: game.whitePlayerProfileImg,
                  },
          },
        })
      );
      return;
    }

    if (game.whiteId != playerId && game.blackId != playerId) {
      game.addUser(ws);
    }

    if (game.gameStarted) {
      chessSocketServer.sendMessageTo(
        game.blackId!,
        JSON.stringify({
          event: "game started",
          data: {
            color: "b",
            opponentData: {
              name: game.whitePlayerName,
              image: game.whitePlayerProfileImg,
            },
          },
        })
      );
      chessSocketServer.sendMessageTo(
        game.whiteId!,
        JSON.stringify({
          event: "game started",
          data: {
            color: "w",
            opponentData: {
              name: game.blackPlayerName,
              image: game.blackPlayerProfileImg,
            },
          },
        })
      );
    } else {
      chessSocketServer.sendMessageTo(
        playerId,
        JSON.stringify({
          event: "game joined",
          data: {
            color: playerId == game.whiteId ? "w" : "b",
            opponentData:
              game.whiteId == playerId
                ? {
                    name: game.blackPlayerName,
                    image: game.blackPlayerProfileImg,
                  }
                : {
                    name: game.whitePlayerName,
                    image: game.whitePlayerProfileImg,
                  },
          },
        })
      );
    }
  }

  move(
    ws: WebSocketWithDetails,
    moveString: string,
    chessSocketServer: ChessSocketServer
  ) {
    const playerId = ws.id;
    const game = this.getGameByPlayerId(playerId);

    if (!game.gameStarted) {
      throw Error("Game has not started");
    }

    if (game.moves.length % 2 == 0) {
      if (playerId == game.blackId) {
        throw Error("Not your turn");
      }

      try {
        game.move(moveString);

        chessSocketServer.sendMessageTo(
          game.blackId!,
          JSON.stringify({
            event: "move",
            data: {
              move: moveString,
            },
          })
        );
      } catch (error) {
        throw Error("Invalid move");
      }
    } else if (game.moves.length % 2 != 0) {
      if (playerId == game.whiteId) {
        throw Error("Not your turn");
      }

      try {
        game.move(moveString);

        chessSocketServer.sendMessageTo(
          game.whiteId!,
          JSON.stringify({
            event: "move",
            data: {
              move: moveString,
            },
          })
        );
      } catch (error) {
        throw Error("Invalid move");
      }
    }

    if (game.isGameFinished()) {
      this.removeGame(game.gameId);
    }
  }
}
