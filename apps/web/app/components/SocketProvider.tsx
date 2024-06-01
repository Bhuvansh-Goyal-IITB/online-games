"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SocketContext {
  socket: WebSocket | null;
  message: string | null;
}

const WebSocketContext = createContext<SocketContext | undefined>(undefined);

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw Error("useSocket must be used inside SocketProvider");
  }

  return context;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL!);
    setSocket(socket);

    const handleOpen = () => {
      const id = localStorage.getItem("id");
      if (id) {
        socket.send(
          JSON.stringify({
            event: "connect",
            data: { playerId: id },
          })
        );
      } else {
        socket.send(
          JSON.stringify({
            event: "connect",
            data: {},
          })
        );
      }
    };

    const handleMessage = (event: MessageEvent) => {
      setMessage(event.data);

      const parsedData = JSON.parse(event.data);

      if (parsedData.event == "id") {
        localStorage.setItem("id", parsedData.data.id);
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
      socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, message }}>
      {children}
    </WebSocketContext.Provider>
  );
}
