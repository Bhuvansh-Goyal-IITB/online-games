"use client";

import { FC, PropsWithChildren, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { SocketContext } from "./socketContext";

export const SocketContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
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
