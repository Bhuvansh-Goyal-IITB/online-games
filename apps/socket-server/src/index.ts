import "dotenv/config";
import { createServer } from "http";
import { Server } from "./server.js";

const httpServer = createServer();
const port = process.env.PORT || 3000;

const server = new Server({ server: httpServer });

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
