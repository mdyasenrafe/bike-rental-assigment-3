import { z } from "zod";

const uploadSchema = z.object({
  url: z.string(),
});

export const uploadValidations = {
  uploadSchema,
};
