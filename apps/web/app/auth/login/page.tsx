"use client";

import { login } from "@/lib";
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
    try {
      await login(data);
    } catch (error: any) {
      if (error.message.includes("credentialssignin")) {
        setErrorMessage("Invalid credentials");
      } else {
        setErrorMessage("Something went wrong");
      }
    }
  };

  const onGithubSubmit = () => {
    signIn("github");
  };

  useEffect(() => {
    if (
      params.has("error") &&
      params.get("error") == "CredentialsSignUpOAuthLogin"
    ) {
      setErrorMessage("This account is signed up with credentials");
    }
  }, []);

  return (
    <div className="flex w-full h-full items-center justify-center">
      <LoginForm
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        onGithubSubmit={onGithubSubmit}
      />
    </div>
  );
};

export default Page;
