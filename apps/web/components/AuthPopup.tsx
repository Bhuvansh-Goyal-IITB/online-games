"use client";

import { createId } from "@paralleldrive/cuid2";
import { Button } from "@ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ui/components/ui/card";
import { useRouter } from "next/navigation";
import { Dispatch, FC, SetStateAction } from "react";

interface AuthPopupProps {
  setAuthPopupShown: Dispatch<SetStateAction<boolean>>;
}

const AuthPopup: FC<AuthPopupProps> = ({ setAuthPopupShown }) => {
  const router = useRouter();
  return (
    <div className="absolute top-0 left-0 w-full h-full z-[1] flex justify-center items-center">
      <Card className="min-w-[250px]">
        <CardContent className="flex flex-col gap-4 p-6">
          <Button
            onClick={() => {
              localStorage.removeItem("id");
              router.push("/auth/login");
            }}
            size="lg"
          >
            Login
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem("id");
              router.push("/auth/sign-up");
            }}
            size="lg"
            variant="outline"
          >
            Signup
          </Button>
          <Button
            onClick={() => {
              if (!localStorage.getItem("id")) {
                localStorage.setItem("id", createId());
              }
              setAuthPopupShown(true);
            }}
            variant="link"
          >
            Play as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPopup;
