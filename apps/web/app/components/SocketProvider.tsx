"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import useWebSocket, { SendMessage } from "react-use-websocket";

interface IWebSocketContext {
  sendMessage: SendMessage;
  message: string | null;
}

const WebSocketContext = createContext<IWebSocketContext | undefined>(
  undefined
);

export function useSocketContext() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw Error("useSocket must be used inside SocketProvider");
  }

  return context;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { sendMessage, lastMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_BACKEND_URL!,
    {
      onOpen: () => {
        const id = localStorage.getItem("id");
        if (id) {
          sendMessage(
            JSON.stringify({
              event: "connect",
              data: { playerId: id },
            })
          );
        } else {
          sendMessage(
            JSON.stringify({
              event: "connect",
              data: {},
            })
          );
        }
      },
    }
  );

  useEffect(() => {
    if (lastMessage != null) {
      const parsedData = JSON.parse(lastMessage.data);

      if (parsedData.event == "id") {
        localStorage.setItem("id", parsedData.data.id);
      }
    }
  }, [lastMessage]);

  return (
    <WebSocketContext.Provider
      value={{ sendMessage, message: lastMessage ? lastMessage.data : null }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
