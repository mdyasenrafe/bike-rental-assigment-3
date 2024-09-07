import express from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { UserRolesObject } from "./user.constant";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserValidations } from "./user.validation";
import { UserControllers } from "./user.controller";

const router = express.Router();

router.get(
  "/me",
  authenticateToken(UserRolesObject.admin, UserRolesObject.user),
  UserControllers.getProfile
);
router.put(
  "/me",
  authenticateToken(UserRolesObject.admin, UserRolesObject.user),
  validateRequest(UserValidations.userUpdateSchema),
  UserControllers.updateProfile
);
router.get(
  "/",
  authenticateToken(UserRolesObject.admin),
  UserControllers.getAllUsers
);
router.put(
  "/role-update/:id",
  authenticateToken(UserRolesObject.admin),
  UserControllers.updateUserRole
);
router.delete(
  "/change-status/:id",
  authenticateToken(UserRolesObject.admin),
  UserControllers.deleteUser
);

export const userRoutes = router;
