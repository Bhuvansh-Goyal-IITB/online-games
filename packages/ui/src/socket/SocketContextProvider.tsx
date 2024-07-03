"use client";

import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import { SocketContext } from "@ui/context/socketContext";
import type { User } from "next-auth";

interface EventHandlers {
  [key: string]: (data: any) => void;
}

interface SocketContextProviderProps extends PropsWithChildren {
  user?: User;
  game: string;
}

export const SocketContextProvider: FC<SocketContextProviderProps> = ({
  children,
  user,
  game,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const closeEventListner = (event: CloseEvent) => {
    if (!event.wasClean) {
      setErrorMessage("Cannot connect to server");
    }
  };

  useEffect(() => {
    const newSocket = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL!);

    newSocket.addEventListener("close", closeEventListner);

    newSocket.onopen = () => {
      if (user) {
        newSocket.send(
          JSON.stringify({
            event: `${game}:auth`,
            data: {
              id: user.id!,
              isGuest: false,
            },
          })
        );
      } else {
        let guestId = localStorage.getItem("id");
        if (!guestId) {
          guestId = createId();
          localStorage.setItem("id", guestId);
        }
        newSocket.send(
          JSON.stringify({
            event: `${game}:auth`,
            data: {
              id: guestId,
              isGuest: true,
            },
          })
        );
      }
    };

    newSocket.onmessage = (messageEvent) => {
      const parsedMessage = JSON.parse(messageEvent.data);

      const event = parsedMessage.event;
      const data = parsedMessage.data;

      if (!event && typeof event != "string") return;

      if (event == "error") {
        if (data.message && typeof data.message == "string") {
          setErrorMessage(data.message);
        } else {
          setErrorMessage("Something went wrong");
        }
        return;
      } else if (event == "Authorized") {
        setAuthorized(true);
        return;
      }

      const eventHandler = eventHandlers[event];

      if (eventHandler) {
        eventHandler(data);
      }
    };

    setSocket(newSocket);

    return () => {
      newSocket.removeEventListener("close", closeEventListner);
      newSocket.close();
    };
  }, []);

  const sendMessage = (event: string, data?: any) => {
    if (!socket || socket.readyState != 1) return;

    const payload: { event: string; data?: any } = {
      event: `${game}:${event}`,
    };
    if (data) payload.data = data;

    socket.send(JSON.stringify(payload));
  };

  const eventHandlersRef = useRef<EventHandlers>({});
  const eventHandlers = eventHandlersRef.current;

  const on = (event: string, eventHandler: (data: any) => void) => {
    eventHandlers[event] = eventHandler;
  };

  return (
    <SocketContext.Provider
      value={{
        sendMessage,
        errorMessage,
        authorized,
        on,
        user,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
