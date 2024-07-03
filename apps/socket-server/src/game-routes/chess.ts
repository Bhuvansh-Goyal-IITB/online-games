import { GameSocketServer } from "../game-server.js";
import {
  drawAcceptHandler,
  drawOfferHandler,
  drawRejectHandler,
  joinGameHandler,
  moveHandler,
  randomGameHandler,
  resignHandler,
} from "../handlers/index.js";
import { RouteHandler } from "../types.js";

export const chessRouteHandler: (
  gameSocketServer: GameSocketServer
) => RouteHandler = (gameSocketServer) => {
  return (action) => {
    switch (action) {
      case "join game":
        return joinGameHandler(gameSocketServer);
      case "random game":
        return randomGameHandler(gameSocketServer);
      case "move":
        return moveHandler(gameSocketServer);
      case "resign":
        return resignHandler(gameSocketServer);
      case "draw offer":
        return drawOfferHandler(gameSocketServer);
      case "draw accept":
        return drawAcceptHandler(gameSocketServer);
      case "draw reject":
        return drawRejectHandler(gameSocketServer);
      default:
        return undefined;
    }
  };
};
