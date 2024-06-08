import { ReactNode } from "react";
import { SocketContextProvider } from "@repo/ui/socket/SocketContextProvider";

export default function Layout({ children }: { children: ReactNode }) {
  return <SocketContextProvider>{children}</SocketContextProvider>;
}
