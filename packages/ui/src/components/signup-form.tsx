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
import { z } from "zod";
import { LoginSchema, SignUpSchema, SignUpType } from "@ui/schema";
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

interface SignUpFormProps {
  errorMessage?: string;
  onSubmit: (data: SignUpType) => void;
}

export const SignUpForm: FC<SignUpFormProps> = ({ errorMessage, onSubmit }) => {
  const form = useForm<SignUpType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  return (
    <Card className="min-w-[400px]">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  name="displayName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="eg: Vishy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                Sign Up
              </Button>
              <div className="flex justify-center items-center text-muted-foreground">
                or
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={form.formState.isSubmitting}
                  variant="outline"
                  className="w-full"
                >
                  <FcGoogle className="w-5 h-5" />
                </Button>
                <Button
                  disabled={form.formState.isSubmitting}
                  variant="outline"
                  className="w-full"
                >
                  <FaGithub className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline">
                Log in
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
