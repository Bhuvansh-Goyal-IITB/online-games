"use client";

import { LoginForm } from "@repo/ui/components/login-form";
import { LoginType } from "@ui/schema";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const params = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>();

  const onSubmit = async (data: LoginType) => {
    setErrorMessage("");
    signIn("credentials", {
      ...data,
      redirectTo: "/",
    });
  };

  const onGithubSubmit = () => {
    setErrorMessage("");
    signIn("github", { redirectTo: "/" });
  };

  const onGoogleSubmit = () => {
    setErrorMessage("");
    console.log("google login");
    signIn("google", { redirectTo: "/" });
  };

  useEffect(() => {
    if (params.has("error")) {
      console.log(params.get("error"));
    }
  }, []);

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
