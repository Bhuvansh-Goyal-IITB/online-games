import { User } from "next-auth";
import { createContext, useContext } from "react";

interface ISocketContext {
  sendMessage: (event: string, data?: any) => void;
  errorMessage: string | null;
  authorized: boolean;
  on: (event: string, eventHandler: (data: any) => void) => void;
  user: User | undefined;
}

export const SocketContext = createContext<ISocketContext | null>(null);

export function useSocketContext() {
  const context = useContext(SocketContext);

  if (context == null) {
    throw Error("useSocket must be used inside SocketProvider");
  }

  return context;
}
