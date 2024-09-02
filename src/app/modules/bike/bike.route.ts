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
  (req, res, next) => {
    const price: any = req.query.price;
    console.log("Received query parameters:", req.query);
    if (price) {
      if (price["gte"] && isNaN(Number(price["gte"]))) {
        return res.status(400).send({ error: "Invalid price[gte] value" });
      }
      if (price["lte"] && isNaN(Number(price["lte"]))) {
        return res.status(400).send({ error: "Invalid price[lte] value" });
      }
    }

    next();
  },
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
  validateRequest(BIkeValidations.bikeUpdateSchema),
  BikeControllers.deleteBike
);

export const bikeRoutes = router;
