import express from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { UserRolesObject } from "../user/user.constant";
import { validateRequest } from "../../middlewares/validateRequest";
import { RentalValidations } from "./rental.validation";
import { RentalControllers } from "./rental.controller";

const router = express.Router();

router.post(
  "/",
  authenticateToken(UserRolesObject.user, UserRolesObject.admin),
  validateRequest(RentalValidations.rentalCreateSchema),
  RentalControllers.createRental
);
router.get(
  "/",
  authenticateToken(UserRolesObject.admin, UserRolesObject.user),
  RentalControllers.getUserRentals
);
router.put(
  "/:id/calculate",
  authenticateToken(UserRolesObject.admin),
  RentalControllers.calculateRentalCost
);
router.get(
  "/get-all-rentals",
  authenticateToken(UserRolesObject.admin),
  RentalControllers.getAllRentals
);

export const RentalRoutes = router;
