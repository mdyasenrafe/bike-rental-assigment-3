import { z } from "zod";

const bikeCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerHour: z.number().min(0, "Price per hour must be positive"),
  isAvailable: z.boolean(),
  cc: z.number().min(50, "CC must be at least 50"),
  year: z.number().min(1990, "Year must be no earlier than 1990"),
  model: z.string().min(1, "Model is required"),
  brand: z.string().min(1, "Brand is required"),
});
const bikeUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  pricePerHour: z.number().min(0, "Price per hour must be positive").optional(),
  isAvailable: z.boolean().optional(),
  cc: z.number().min(50, "CC must be at least 50").optional(),
  year: z.number().min(1990, "Year must be no earlier than 1990").optional(),
  model: z.string().min(1, "Model is required").optional(),
  brand: z.string().min(1, "Brand is required").optional(),
});

export const BIkeValidations = {
  bikeCreateSchema,
  bikeUpdateSchema,
};
