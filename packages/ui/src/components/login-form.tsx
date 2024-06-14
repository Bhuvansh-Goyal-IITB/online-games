"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import Link from "next/link";
import { Button } from "@ui/components/ui/button";
import { useForm } from "react-hook-form";
import { LoginSchema, LoginType } from "@ui/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { FC } from "react";
import FormError from "./form-error";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

interface LoginFormProps {
  errorMessage?: string;
  onGithubSubmit: () => void;
  onGoogleSubmit: () => void;
  onSubmit: (data: LoginType) => void;
}

export const LoginForm: FC<LoginFormProps> = ({
  errorMessage,
  onSubmit,
  onGithubSubmit,
  onGoogleSubmit,
}) => {
  const form = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormError errorMessage={errorMessage} />
              </div>
              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className="w-full"
              >
                Login
              </Button>
              <div className="flex justify-center items-center text-muted-foreground">
                or
              </div>
            </div>
          </form>
        </Form>
        <div className="flex gap-2">
          <Button
            disabled={form.formState.isSubmitting}
            variant="outline"
            className="w-full"
            onClick={onGoogleSubmit}
          >
            <FcGoogle className="w-5 h-5" />
          </Button>
          <Button
            disabled={form.formState.isSubmitting}
            variant="outline"
            className="w-full"
            onClick={onGithubSubmit}
          >
            <FaGithub className="w-5 h-5" />
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
