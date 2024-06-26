import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getProfile = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: "User profile retrieved successfully",
    data: null,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: "Profile updated successfully",
    data: null,
  });
});

export const UserControllers = {
  getProfile,
  updateProfile,
};
