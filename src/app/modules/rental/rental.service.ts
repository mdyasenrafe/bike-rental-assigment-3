import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { BikeModel } from "../bike/bike.model";
import { TRental } from "./rental.interace";
import { RentalModel } from "./rental.model";
import mongoose, { Types } from "mongoose";
import { TBike } from "../bike/bike.interface";

const createRentalIntoDB = async (userId: Types.ObjectId, payload: TRental) => {
  payload["userId"] = userId;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { bikeId } = payload;
    const bike = await BikeModel.findById(payload.bikeId).session(session);

    if (!bike) {
      throw new AppError(httpStatus.NOT_FOUND, "No data found");
    }

    if (!bike?.isAvailable) {
      throw new AppError(httpStatus.NOT_FOUND, "Bike is not available");
    }

    const result = await RentalModel.create([payload], { session });
    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Failed to create rental record"
      );
    }
    const updateBikeAvailable = await BikeModel.findOneAndUpdate(
      { _id: bikeId },
      {
        isAvailable: false,
      },
      {
        new: true,
        session,
      }
    );
    if (!updateBikeAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Unable to update: The bike with the specified ID does not exist or cannot be updated."
      );
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error);
  }
};
const returnBikeToDB = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const rental = await RentalModel.findById(id)
      .populate<{ bikeId: TBike }>("bikeId")
      .populate("userId")
      .session(session);

    if (!rental) {
      throw new AppError(httpStatus.NOT_FOUND, "No Data Found");
    }
    console.log(rental.isReturned);
    if (rental.isReturned) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rental has already been returned"
      );
    }

    const endTime = new Date();
    const startTime = new Date(rental.startTime);

    // Calculate the duration in hours
    const duration: number =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    let totalCost = duration * rental.bikeId.pricePerHour;
    totalCost = Math.ceil(totalCost * 100) / 100;
    const payload = {
      returnTime: endTime,
      totalCost: totalCost,
      isReturned: true,
    };
    const result = await RentalModel.findOneAndUpdate({ _id: id }, payload, {
      new: true,
      session,
    });

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Failed to update rental record"
      );
    }

    const updateBikeAvailable = await BikeModel.findOneAndUpdate(
      { _id: result?.bikeId },
      {
        isAvailable: true,
        session,
      }
    );
    if (!updateBikeAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Unable to update: The bike with the specified ID does not exist or cannot be updated."
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error);
  }
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
