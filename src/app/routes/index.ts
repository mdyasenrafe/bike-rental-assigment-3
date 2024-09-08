import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { RentalRoutes } from "../modules/rental/rental.route";
import { bikeRoutes } from "../modules/bike/bike.route";
import { uploadRoutes } from "../modules/upload/upload.route";
import { CouponRoutes } from "../modules/coupon/coupon.route";

const router = Router();

const modulesRoutes = [
  {
    path: "/upload",
    route: uploadRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/bikes",
    route: bikeRoutes,
  },
  {
    path: "/rentals",
    route: RentalRoutes,
  },
  {
    path: "/coupons",
    route: CouponRoutes,
  },
];

modulesRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
