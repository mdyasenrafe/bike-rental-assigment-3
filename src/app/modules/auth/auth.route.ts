import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthValidations } from "./auth.validation";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

router.post(
  "/signup",
  validateRequest(AuthValidations.userSignupSchema),
  AuthControllers.register
);

export const AuthRoutes = router;
