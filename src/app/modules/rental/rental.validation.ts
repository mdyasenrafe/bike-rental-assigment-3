import { z } from "zod";

const rentalCreateSchema = z.object({
  bikeId: z.string().min(1, "Bike ID is required"),
  startTime: z.date(),
});

export const RentalValidations = {
  rentalCreateSchema,
};
