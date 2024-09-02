import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BikeServices } from "./bike.service";

const createBike = catchAsync(async (req, res) => {
  const result = await BikeServices.createBikeIntoDB(req.body);
  sendResponse(res, {
    message: "Bike added successfully",
    data: result,
  });
});
const getAllBikes = catchAsync(async (req, res) => {
  const result = await BikeServices.getAllBikesFromDB(req.query);
  sendResponse(res, {
    message: "Bikes retrieved successfully",
    data: result,
  });
});
const updateBike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BikeServices.updateBikeIntoDB(id, req.body);
  sendResponse(res, {
    message: "Bike updated successfully",
    data: result,
  });
});

const deleteBike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BikeServices.deleteBikeFromDB(id);
  sendResponse(res, {
    message: "Bike deleted successfully",
    data: result,
  });
});

const getAllBikeModels = catchAsync(async (req, res) => {
  const bikeModels = await BikeServices.getBikeModelsFromDB();
  sendResponse(res, {
    message: "Bike models retrieved successfully",
    data: bikeModels,
  });
});

export const BikeControllers = {
  createBike,
  getAllBikes,
  updateBike,
  deleteBike,
  getAllBikeModels,
};
