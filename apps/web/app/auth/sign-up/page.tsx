"use client";

import { signUpUser } from "@/lib";
import { SignUpForm } from "@repo/ui/components/signup-form";
import { SignUpType } from "@ui/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();

  const onSubmit = (data: SignUpType) => {
    setErrorMessage("");
    signUpUser(data.email, data.password, data.displayName)
      .then(() => {
        router.push("/auth/login");
      })
      .catch((err) => {
        console.log(err);
        if (err.message.includes("UNIQUE")) {
          if (err.message.includes("users.email")) {
            setErrorMessage("Email already registered");
          } else {
            setErrorMessage("Display name already registered");
          }
        } else {
          setErrorMessage("Something went wrong");
        }
      });
  };

  return (
    <div className="flex w-full h-full items-center justify-center">
      <SignUpForm errorMessage={errorMessage} onSubmit={onSubmit} />
    </div>
  );
};

export default Page;