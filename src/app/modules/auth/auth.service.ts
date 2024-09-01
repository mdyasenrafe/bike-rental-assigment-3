import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { TUser } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/generateToken";

const createUserIntoDB = async (payload: TUser) => {
  if (payload.role === "admin") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to create an admin user"
    );
  }

  const result = await UserModel.create(payload);
  return result;
};

const signinUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }
  const token = generateToken(user._id, user.role);
  return { data: user, token };
};
export const AuthServices = {
  createUserIntoDB,
  signinUser,
};
