import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { BikeModel } from "../bike/bike.model";
import { TRental } from "./rental.interace";
import { RentalModel } from "./rental.model";
import mongoose, { Types } from "mongoose";

const createRentalIntoDB = async (userId: Types.ObjectId, payload: TRental) => {
  console.log("userId createRentalIntoDB", userId);
  payload["userId"] = userId;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { bikeId } = payload;
    const bike = await BikeModel.findById(payload.bikeId).session(session);
    if (!bike || !bike.isAvailable) {
      throw new AppError(httpStatus.NOT_FOUND, "Bike is not available");
    }
    const result = await RentalModel.create([payload], { session });

    const updateBIkeAvailable = await BikeModel.findOneAndUpdate(
      { _id: bikeId },
      {
        isAvailable: false,
      },
      {
        new: true,
        session,
      }
    );
    session.commitTransaction();
    return result;
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw new AppError(httpStatus.BAD_REQUEST, error);
  } finally {
    session.endSession();
  }
};
const returnBikeToDB = async (id: string) => {
  // calculate total cost
  // update rental model
  // update bike
  const date = new Date();
};

const getRentalsByUserFRomDb = async (userId: string) => {
  const result = await RentalModel.find({ userId: userId });
  if (result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No Data Found");
  }
  return result;
};

export const RentalServices = {
  createRentalIntoDB,
  returnBikeToDB,
  getRentalsByUserFRomDb,
};
