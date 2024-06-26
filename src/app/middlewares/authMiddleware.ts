import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { TUserRoles } from "../modules/user/user.interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { UserModel } from "../modules/user/user.model";
import { AppError } from "../errors/appError";
import httpStatus from "http-status";

export const authenticateToken = (...requiredRoles: TUserRoles[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(
        token,
        config.access_token_secret as string
      ) as JwtPayload;
      const { role, userId } = decoded;
      if (requiredRoles && !requiredRoles.includes(role)) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not unauthorized");
      }
      const user = await UserModel.findById(userId);

      req.user = decoded as JwtPayload;
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
      }
    } else {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not unauthorized");
    }
    next();
  });
};
