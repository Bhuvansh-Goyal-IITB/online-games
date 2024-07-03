import { ChessContextProvider } from "@repo/ui/chess/ChessContextProvider";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={
        "w-full min-h-[100%] p-8 bg-background flex justify-center items-center"
      }
    >
      <ChessContextProvider>{children}</ChessContextProvider>
    </div>
  );
};

export default Layout;
