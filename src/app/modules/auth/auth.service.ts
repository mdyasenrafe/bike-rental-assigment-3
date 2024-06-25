import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { TUser } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import bcrypt from "bcrypt";

const createUserIntoDB = async (payload: TUser) => {
  const result = await UserModel.create(payload);
  return result;
};

const signinUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }
  return { data: user };
};
export const AuthServices = {
  createUserIntoDB,
  signinUser,
};
