import { ReactNode } from "react";
import { SocketProvider } from "@/app/components/SocketProvider";

export default function Layout({ children }: { children: ReactNode }) {
  return <SocketProvider>{children}</SocketProvider>;
}
