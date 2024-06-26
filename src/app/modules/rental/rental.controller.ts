import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalServices } from "./rental.service";

const createRental = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await RentalServices.createRentalIntoDB(user?.id, req.body);
  sendResponse(res, {
    data: result,
    message: "Rental created successfully",
  });
});

const ReturnBike = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await RentalServices.returnBikeToDB(id);
  sendResponse(res, {
    data: result,
    message: "Rental created successfully",
  });
});

const getUserRentals = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await RentalServices.getRentalsByUserFRomDb(user?.id);
  sendResponse(res, {
    data: result,
    message: "Rental created successfully",
  });
});

export const RentalControllers = {
  createRental,
  ReturnBike,
  getUserRentals,
};
