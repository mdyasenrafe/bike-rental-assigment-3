import express from "express";
import { UserRolesObject } from "../user/user.constant";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { CouponControllers } from "./coupon.controller";

const router = express.Router();

router.post(
  "/validate",
  authenticateToken(UserRolesObject.user, UserRolesObject.admin),
  CouponControllers.validateCoupon
);

export const CouponRoutes = router;
