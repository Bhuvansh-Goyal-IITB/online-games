"use client";

import { FC, PropsWithChildren, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { SocketContext } from "../context/socketContext";

interface EventHandlers {
  [key: string]: (data: any) => void;
}

export const SocketContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.NEXT_PUBLIC_BACKEND_URL!
  );
  const eventHandlersRef = useRef<EventHandlers>({});
  const eventHandlers = eventHandlersRef.current;

  const on = (event: string, eventHandler: (data: any) => void) => {
    eventHandlers[event] = eventHandler;
  };

  useEffect(() => {
    if (lastMessage) {
      const parsedMessage = JSON.parse(lastMessage.data);

      const event = parsedMessage.event;

      if (!event) return;

      const eventHandler = eventHandlers[event];
      const eventData = parsedMessage.data;

      if (eventHandler) {
        eventHandler(eventData);
      }
    }
  }, [lastMessage]);
  return (
    <SocketContext.Provider
      value={{
        sendMessage,
        message: lastMessage ? lastMessage.data : null,
        readyState,
        on,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
