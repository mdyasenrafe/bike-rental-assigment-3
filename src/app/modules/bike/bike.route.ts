import express from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { UserRolesObject } from "../user/user.constant";
import { validateRequest } from "../../middlewares/validateRequest";
import { BIkeValidations } from "./bike.validation";
import { BikeControllers } from "./bike.controller";

const router = express.Router();

router.post(
  "/",
  authenticateToken(UserRolesObject.admin),
  validateRequest(BIkeValidations.bikeCreateSchema),
  BikeControllers.createBike
);
router.get(
  "/",
  authenticateToken(UserRolesObject.admin, UserRolesObject.user),
  BikeControllers.getAllBikes
);
router.put(
  "/:id",
  authenticateToken(UserRolesObject.admin),
  BikeControllers.updateBike
);
router.delete(
  "/:id",
  authenticateToken(UserRolesObject.admin),
  BikeControllers.updateBike
);

export const bikeRoutes = router;
