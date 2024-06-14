import { z } from "zod";

export const SignUpSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({ message: "Invalid email address" }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(30, { message: "Password can only be 30 characters long" }),
  displayName: z.string({
    required_error: "Display name is required",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export type LoginType = z.infer<typeof LoginSchema>;
export type SignUpType = z.infer<typeof SignUpSchema>;
