import express from "express";
import { UserRolesObject } from "../user/user.constant";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { CouponControllers } from "./coupon.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { CouponValidationSchema } from "./coupon.validation";

const router = express.Router();

router.post(
  "/",
  authenticateToken(UserRolesObject.admin),
  validateRequest(CouponValidationSchema.createCouponSchema),
  CouponControllers.createCoupon
);

router.post(
  "/validate",
  authenticateToken(UserRolesObject.user, UserRolesObject.admin),
  validateRequest(CouponValidationSchema.validateCouponSchema),
  CouponControllers.validateCoupon
);

router.get(
  "/",
  authenticateToken(UserRolesObject.user, UserRolesObject.admin),
  CouponControllers.getCoupons
);
router.delete(
  "/:id",
  authenticateToken(UserRolesObject.admin),
  CouponControllers.updateCoupon
);

export const CouponRoutes = router;
