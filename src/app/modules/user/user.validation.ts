import { z } from "zod";

const userUpdateSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
  phone: z
    .string()
    .min(10, { message: "Your phone number must be at least 10 digits long." })
    .optional(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters long")
    .optional(),
  role: z
    .enum(["admin", "user"], {
      message: "Role must be either 'admin' or 'user'",
    })
    .optional(),
});

export const UserValidations = {
  userUpdateSchema,
};
