"use client";

import { DropdownMenuItem } from "@repo/ui/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

const LogOutButton = () => {
  return (
    <DropdownMenuItem
      onClick={() => {
        signOut({ callbackUrl: "/" });
      }}
    >
      Log Out
    </DropdownMenuItem>
  );
};

export default LogOutButton;
