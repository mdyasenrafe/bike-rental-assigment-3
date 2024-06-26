import { Types } from "mongoose";
import { TBike } from "./bike.interface";
import { BikeModel } from "./bike.model";

const createBikeIntoDB = async (payload: TBike) => {
  const result = await BikeModel.create(payload);
  return result;
};

const getAllBikesFromDB = async () => {
  const result = await BikeModel.find();
  return result;
};

const updateBikeIntoDB = async (id: string, payload: Partial<TBike>) => {
  const result = await BikeModel.findOneAndUpdate({ _id: id }, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteBikeFromDB = async (id: string) => {
  const result = await BikeModel.findOneAndDelete({ _id: id });
  return result;
};

export const BikeServices = {
  createBikeIntoDB,
  getAllBikesFromDB,
  updateBikeIntoDB,
  deleteBikeFromDB,
};
