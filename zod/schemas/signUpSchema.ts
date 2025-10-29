import * as z from 'zod';

export const signUpSchema = z.object({
    email: z.string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters long"),
    passwordConfirm: z.string()
      .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
});