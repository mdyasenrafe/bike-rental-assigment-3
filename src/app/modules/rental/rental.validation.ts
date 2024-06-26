import { z } from "zod";

const rentalCreateSchema = z.object({
  bikeId: z.string().min(1, "Bike ID is required"),
  startTime: z.date().refine((date) => date > new Date(), {
    message: "Start time must be in the future",
  }),
});

export const RentalValidations = {
  rentalCreateSchema,
};
