import { z } from "zod";

const rentalCreateSchema = z.object({
  bikeId: z.string().min(1, "Bike ID is required"),
  startTime: z
    .string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => date >= new Date(), {
      message: "Start time must be a valid future or current date",
    }),
});

const calculateRentalCostSchema = z.object({
  endTime: z
    .string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), {
      message: "End time must be a valid date",
    }),
});

export const RentalValidations = {
  rentalCreateSchema,
  calculateRentalCostSchema,
};
