import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Userservices } from "./user.service";

const getProfile = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await Userservices.getUserFromDB(user.userId);
  sendResponse(res, {
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { user, body } = req;
  const result = await Userservices.updateUserIntoDB(user, body);
  sendResponse(res, {
    message: "Profile updated successfully",
    data: result,
  });
});
const getAllUsers = catchAsync(async (req, res) => {
  const { result, meta } = await Userservices.getAllUsersFromDB(req.query);
  sendResponse(res, {
    message: "get users fetched successfully",
    data: result,
    meta: meta,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await Userservices.updateUserRoleInDB(id);
  sendResponse(res, {
    message: "User role updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Userservices.deleteUserFromDB(id);
  sendResponse(res, {
    message: "User deleted successfully",
    data: null,
  });
});

export const UserControllers = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
