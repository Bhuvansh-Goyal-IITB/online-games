import React, { FC, PropsWithChildren } from "react";
import { ChessContextProvider } from "@repo/ui/chess/ChessContextProvider";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return <ChessContextProvider>{children}</ChessContextProvider>;
};

export default Layout;
