import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { TUserRoles } from "../modules/user/user.interface";

export const authenticateToken = (...requiredRoles: TUserRoles[]) => {
  return catchAsync((req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
  });
};
