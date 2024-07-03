import { ReactNode } from "react";
import { SocketContextProvider } from "@repo/ui/socket/SocketContextProvider";
import { currentUser } from "@/lib";
import SocketError from "@/components/SocketError";

export const runtime = "edge";

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  return (
    <SocketContextProvider user={user} game="chess">
      <SocketError>{children}</SocketError>
    </SocketContextProvider>
  );
}
