import { Types } from "mongoose";
import { UserModel } from "./user.model";
import { TUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errors/appError";
import httpStatus from "http-status";

export const getUserFromDB = async (id: Types.ObjectId) => {
  const result = await UserModel.findById(id);
  return result;
};

export const updateUserIntoDB = async (
  currentUser: JwtPayload,
  payload: Partial<TUser>
) => {
  const { id, role } = currentUser;
  if ("role" in payload && role !== "admin") {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Unauthorized role change attempt: Only users with the admin role can change user roles. Please remove the role field from the request body if you wish to proceed."
    );
  }
  const result = await UserModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};
