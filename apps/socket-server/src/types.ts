import WebSocket from "ws";

export type EventHandler = (ws: WebSocket, data: any) => Promise<void>;

export interface PlayerInfo {
  name: string;
  id: string;
  image?: string;
  gameId?: string;
}

export type WebSocketWithInfo = WebSocket & PlayerInfo;
