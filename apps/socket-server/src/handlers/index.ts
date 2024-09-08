import { Server } from "../server.js";
import { EventHandler } from "../types.js";
import { drawAcceptHandler } from "./draw-accept.js";
import { drawOfferHandler } from "./draw-offer.js";
import { drawRejectHandler } from "./draw-reject.js";
import { joinHandler } from "./join.js";
import { moveHandler } from "./move.js";
import { randomHandler } from "./random.js";
import { resignHandler } from "./resign.js";

export const getEventHandler: (
  server: Server,
  event: string,
) => EventHandler | undefined = (server: Server, event: string) => {
  switch (event) {
    case "join game":
      return joinHandler(server);
    case "random game":
      return randomHandler(server);
    case "move":
      return moveHandler(server);
    case "resign":
      return resignHandler(server);
    case "draw offer":
      return drawOfferHandler(server);
    case "draw accept":
      return drawAcceptHandler(server);
    case "draw reject":
      return drawRejectHandler(server);
    default:
      return undefined;
  }
};
