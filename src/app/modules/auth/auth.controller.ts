import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const register = catchAsync(async (req: Request, res: Response) => {
  sendResponse(res, {
    data: null,
    message: "User registered successfully",
  });
});

export const AuthControllers = {
  register,
};
