import express from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { UserRolesObject } from "../user/user.constant";
import { validateRequest } from "../../middlewares/validateRequest";
import { RentalValidations } from "./rental.validation";
import { RentalControllers, handleStripeWebhook } from "./rental.controller";
import bodyParser from "body-parser";

const router = express.Router();

router.post(
  "/",
  authenticateToken(UserRolesObject.user, UserRolesObject.admin),
  validateRequest(RentalValidations.rentalCreateSchema),
  RentalControllers.createRental
);
router.put(
  "/:id/return",
  authenticateToken(UserRolesObject.admin),
  RentalControllers.ReturnBike
);
router.get(
  "/",
  authenticateToken(UserRolesObject.admin, UserRolesObject.user),
  RentalControllers.getUserRentals
);

router.post(
  "/webhooks/stripe",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

export const RentalRoutes = router;
