"use client";

import { LoginForm } from "@repo/ui/components/login-form";
import { LoginType } from "@ui/schema";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const Page = () => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const onSubmit = async (data: LoginType) => {
    setErrorMessage("");
    signIn("credentials", {
      ...data,
      callbackUrl: "/",
    });
  };

  const onGithubSubmit = () => {
    setErrorMessage("");
    signIn("github", { callbackUrl: "/" });
  };

  const onGoogleSubmit = () => {
    setErrorMessage("");
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex w-full h-full items-center justify-center">
      <LoginForm
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        onGithubSubmit={onGithubSubmit}
        onGoogleSubmit={onGoogleSubmit}
      />
    </div>
  );
};

export default Page;
