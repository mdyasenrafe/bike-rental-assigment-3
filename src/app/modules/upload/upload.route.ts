import express from "express";
import { uploadControllers } from "./upload.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { uploadValidations } from "./upload.validation";

const router = express.Router();

router.post(
  "/image",
  validateRequest(uploadValidations.uploadSchema),
  uploadControllers.uploadImage
);

export const uploadRoutes = router;
