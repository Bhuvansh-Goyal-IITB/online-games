"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import Link from "next/link";
import { Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export const ProfileWidget = () => {
  const session = useSession();

  return (
    <div className="flex gap-2 m-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={session.status == "loading"}
            variant="outline"
            size="icon"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-6">
          {session.status != "authenticated" ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/auth/login">Log In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                }}
              >
                Log Out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
