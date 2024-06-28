import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import Link from "next/link";
import { Settings } from "lucide-react";
import { currentUser } from "@/lib";
import LogOutButton from "./LogOutButton";

export const runtime = "edge";

export const ProfileWidget = async () => {
  const user = await currentUser();

  return (
    <div className="flex gap-2 m-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-6">
          {user == undefined ? (
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
              <DropdownMenuItem asChild>
                <LogOutButton />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
