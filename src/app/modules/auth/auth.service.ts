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
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  return { data: user };
};
export const AuthServices = {
  createUserIntoDB,
  signinUser,
};
