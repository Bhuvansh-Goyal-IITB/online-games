import React, { FC } from "react";
import { ChessContextProvider } from "@repo/ui/chess/ChessContextProvider";
import { ChessBoard } from "@ui/chess/ChessBoard";

const Page: FC = () => {
  return (
    <div className="w-full h-full bg-background flex justify-center items-center">
      <ChessContextProvider>
        <ChessBoard />
      </ChessContextProvider>
    </div>
  );
};

export default Page;
