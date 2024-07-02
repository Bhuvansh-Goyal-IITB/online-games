import { WebSocket } from "ws";

export interface RouteHandlers {
  [key: string]: RouteHandler;
}

export type MessageHandler = (
  sendMessage: (event: string, data?: any) => void,
  playerInfo: PlayerInfo,
  data: any
) => Promise<void> | void;

export type RouteHandler = (action: string) => MessageHandler | undefined;

export type PlayerInfo = {
  id: string;
  name: string;
  image?: string;
};

export type Game = "chess";

export type WebSocketWithInfo = WebSocket &
  PlayerInfo & {
    game: string;
  };
