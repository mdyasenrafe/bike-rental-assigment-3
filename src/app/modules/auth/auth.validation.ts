import { z } from "zod";

const userSignupSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  phone: z.string().length(10, { message: "Phone must be 10 digits" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters long" }),
  role: z.enum(["admin", "user"], {
    message: "Role must be either 'admin' or 'user'",
  }),
});
const userSigninSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const AuthValidations = {
  userSignupSchema,
  userSigninSchema,
};
