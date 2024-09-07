import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalServices } from "./rental.service";

const createRental = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await RentalServices.createRentalIntoDB(
    user?.userId,
    req.body
  );
  sendResponse(res, {
    data: result?.rental,
    clientSecret: result?.clientSecret as string,
    message: "Rental created successfully",
  });
});

const ReturnBike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RentalServices.returnBikeToDB(id);
  sendResponse(res, {
    data: result,
    message: "Bike returned successfully",
  });
});

const getUserRentals = catchAsync(async (req, res) => {
  const userId = req?.user?.userId;
  const { result, meta } = await RentalServices.getRentalsByUserFRomDb(
    req?.query,
    userId
  );
  sendResponse(res, {
    data: result,
    meta: meta,
    message: "Rentals retrieved successfully",
  });
});

const getAllRentals = catchAsync(async (req, res) => {
  const { result, meta } = await RentalServices.getAllRentalsFromDB(req?.query);
  sendResponse(res, {
    data: result,
    meta: meta,
    message: "Rentals retrieved successfully",
  });
});

const calculateRentalCost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { endTime } = req.body;
  const result = await RentalServices.calculateRentalCost(
    id,
    new Date(endTime)
  );
  sendResponse(res, {
    data: result,
    message: "Rental cost calculated successfully, bike is available.",
  });
});

export const RentalControllers = {
  createRental,
  ReturnBike,
  getUserRentals,
  getAllRentals,
  calculateRentalCost,
};
