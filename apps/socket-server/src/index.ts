import "dotenv/config";
import { createServer } from "http";
import { GameSocketServer } from "./game-server.js";
import { chessRouteHandler } from "./game-routes/index.js";

const server = createServer();
const port = process.env.PORT || 3000;

const gameSocketServer = new GameSocketServer({ server });

gameSocketServer.on("chess", chessRouteHandler(gameSocketServer));

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
