"use client";

import { createId } from "@paralleldrive/cuid2";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent } from "@ui/components/ui/card";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

const AuthPopup: FC = () => {
  const [shown, setShown] = useState(false);
  const router = useRouter();

  if (shown) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full z-[1] flex justify-center items-center">
      <Card className="min-w-[250px]">
        <CardContent className="flex flex-col gap-4 p-6">
          <Button
            onClick={() => {
              router.push("/auth/login");
            }}
            size="lg"
          >
            Login
          </Button>
          <Button
            onClick={() => {
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
              setShown(true);
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
