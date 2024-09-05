import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { BikeModel } from "../bike/bike.model";
import { TRental, TRentalStatusUpdate } from "./rental.interace";
import { RentalModel } from "./rental.model";
import mongoose, { Types } from "mongoose";
import { TBike } from "../bike/bike.interface";
import { stripe } from "../../config";

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

    // Create a PaymentIntent for the total rental cost
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100 * 100,
      currency: "bdt",
      payment_method_types: ["card"],
    });

    // Create rental record in the database with paymentIntentId
    const rentalResult = await RentalModel.create(
      [
        {
          ...payload,
          paymentIntentId: paymentIntent.id,
          paymentStatus: "pending",
        },
      ],
      { session }
    );

    // Update bike availability
    const updateBikeAvailable = await BikeModel.findOneAndUpdate(
      { _id: bikeId },
      { isAvailable: false },
      { new: true, session }
    );
    if (!updateBikeAvailable) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Unable to update: The bike with the specified ID does not exist or cannot be updated."
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return {
      rental: rentalResult,
      clientSecret: paymentIntent.client_secret,
    };
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
      },
      {
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

export const updateRentalPaymentStatus = async ({
  paymentIntentId,
  status,
}: TRentalStatusUpdate) => {
  const rental = await RentalModel.findOneAndUpdate(
    { paymentIntentId },
    { paymentStatus: status === "succeeded" ? "paid" : "failed" },
    { new: true }
  );

  if (!rental) {
    throw new AppError(httpStatus.NOT_FOUND, "No Data Found");
  }

  if (status === "failed") {
    const bikeUpdate = await BikeModel.findByIdAndUpdate(
      rental.bikeId,
      { isAvailable: true },
      { new: true }
    );

    if (!bikeUpdate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Failed to update bike availability"
      );
    }
  }

  return rental;
};

export const RentalServices = {
  createRentalIntoDB,
  returnBikeToDB,
  getRentalsByUserFRomDb,
};
