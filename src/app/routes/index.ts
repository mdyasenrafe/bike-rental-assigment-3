import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { RentalRoutes } from "../modules/rental/rental.route";
import { bikeRoutes } from "../modules/bike/bike.route";

const router = Router();

const modulesRoutes = [
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
];

modulesRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
