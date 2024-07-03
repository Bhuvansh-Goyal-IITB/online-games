"use client";

import { useSocketContext } from "@repo/ui/context/socketContext";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";

const SocketError: FC<PropsWithChildren> = ({ children }) => {
  const { errorMessage } = useSocketContext();

  if (errorMessage) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center gap-4 text-lg">
        {errorMessage}
        <div>
          <Button asChild>
            <Link href="/chess">Back</Link>
          </Button>
        </div>
      </div>
    );
  } else {
    return <>{children}</>;
  }
};

export default SocketError;
