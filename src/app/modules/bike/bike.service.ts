import { Types } from "mongoose";
import { TBike } from "./bike.interface";
import { BikeModel } from "./bike.model";
import { AppError } from "../../errors/appError";
import httpStatus from "http-status";

const createBikeIntoDB = async (payload: TBike) => {
  const result = await BikeModel.create(payload);
  return result;
};

const getAllBikesFromDB = async () => {
  const result = await BikeModel.find();
  if (result.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No bikes found: The database does not contain any bikes."
    );
  }
  return result;
};

const updateBikeIntoDB = async (id: string, payload: Partial<TBike>) => {
  const bike = await BikeModel.findById(id);
  if (!bike) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Bike not found: The bike with the specified ID does not exist."
    );
  }
  const result = await BikeModel.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteBikeFromDB = async (id: string) => {
  const bike = await BikeModel.findById(id);
  if (!bike) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Bike not found: The bike with the specified ID does not exist."
    );
  }
  const result = await BikeModel.findOneAndDelete({ _id: id });
  return result;
};

export const BikeServices = {
  createBikeIntoDB,
  getAllBikesFromDB,
  updateBikeIntoDB,
  deleteBikeFromDB,
};
