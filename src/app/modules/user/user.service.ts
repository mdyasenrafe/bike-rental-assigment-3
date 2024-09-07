import { Types } from "mongoose";
import { UserModel } from "./user.model";
import { TUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errors/appError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import QueryBuilder from "../../builder/QueryBuilder";

const getUserFromDB = async (id: Types.ObjectId) => {
  const result = await UserModel.findById(id);
  return result;
};

const updateUserIntoDB = async (
  currentUser: JwtPayload,
  payload: Partial<TUser>
) => {
  const { userId, role } = currentUser;
  if ("role" in payload) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Role cannot be updated. Please remove the role field from the request body if you wish to proceed."
    );
  }
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 12);
  }
  const result = await UserModel.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ["name", "model"];
  const usersQuery = new QueryBuilder(UserModel.find({ role: "user" }), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();
  console.log("meta", meta);
  return {
    meta,
    result,
  };
};

const updateUserRoleInDB = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await UserModel.findByIdAndUpdate(
    id,
    { role: "admin" },
    {
      new: true,
      runValidators: true,
    }
  );
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const result = await UserModel.findByIdAndUpdate(
    id,
    { status: "deleted" },
    { new: true }
  );
  return result;
};

export const Userservices = {
  getUserFromDB,
  updateUserIntoDB,
  getAllUsersFromDB,
  updateUserRoleInDB,
  deleteUserFromDB,
};
