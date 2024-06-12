import { ChessSocketServer } from "./ChessSocketServer";
import { Game } from "./Game";

export class GameManager {
  private games: Game[] = [];

  getGame(gameId: string) {
    const game = this.games.find((game) => game.gameId == gameId);

    if (!game) {
      throw Error("Game does not exist");
    }

    return game;
  }

  createGame() {
    const newGame = new Game();
    this.games.push(newGame);
    return newGame.gameId;
  }

  joinGame(
    gameId: string,
    playerId: string,
    chessSocketServer: ChessSocketServer
  ) {
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
          },
        })
      );
      return;
    }

    game.addUser(playerId);

    if (game.gameStarted) {
      chessSocketServer.sendMessageTo(
        game.blackId!,
        JSON.stringify({
          event: "game started",
          data: {
            color: "b",
          },
        })
      );
      chessSocketServer.sendMessageTo(
        game.whiteId!,
        JSON.stringify({
          event: "game started",
          data: {
            color: "w",
          },
        })
      );
    }
  }

  move(
    gameId: string,
    playerId: string,
    moveString: string,
    chessSocketServer: ChessSocketServer
  ) {
    const game = this.getGame(gameId);

    if (!game.gameStarted) {
      throw Error("Game has not started");
    }

    if (game.whiteId != playerId && game.blackId != playerId) {
      throw Error("You are not a player of this game");
    }

    if (game.moves.length % 2 == 0) {
      if (playerId == game.blackId) {
        throw Error("Not your turn");
      }

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
    } else if (game.moves.length % 2 != 0) {
      if (playerId == game.whiteId) {
        throw Error("Not your turn");
      }

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
    }
  }
}
