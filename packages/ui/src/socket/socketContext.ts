import { createContext, useContext } from "react";
import { ReadyState, SendMessage } from "react-use-websocket";

interface ISocketContext {
  sendMessage: SendMessage;
  message: string | null;
  readyState: ReadyState;
}

export const SocketContext = createContext<ISocketContext | null>(null);

export function useSocketContext() {
  const context = useContext(SocketContext);

  if (context == null) {
    throw Error("useSocket must be used inside SocketProvider");
  }

  return context;
}
