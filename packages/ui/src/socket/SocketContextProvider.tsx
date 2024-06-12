"use client";

import { FC, PropsWithChildren, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { SocketContext } from "./socketContext";

export const SocketContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.NEXT_PUBLIC_BACKEND_URL!
  );
  return (
    <SocketContext.Provider
      value={{
        sendMessage,
        message: lastMessage ? lastMessage.data : null,
        readyState,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
