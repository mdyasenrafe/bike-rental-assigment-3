import { Types } from "mongoose";
import { TBike } from "./bike.interface";
import { BikeModel } from "./bike.model";
import { AppError } from "../../errors/appError";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";

const createBikeIntoDB = async (payload: TBike) => {
  const result = await BikeModel.create(payload);
  return result;
};

const getAllBikesFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ["name"];
  const academicDepartmentQuery = new QueryBuilder(BikeModel.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await academicDepartmentQuery.modelQuery;
  const meta = await academicDepartmentQuery.countTotal();

  return {
    meta,
    result,
  };
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
