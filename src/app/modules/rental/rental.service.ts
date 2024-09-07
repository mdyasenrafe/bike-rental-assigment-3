import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { BikeModel } from "../bike/bike.model";
import { TRental, TRentalStatusUpdate } from "./rental.interace";
import { RentalModel } from "./rental.model";
import mongoose, { Types } from "mongoose";
import { TBike } from "../bike/bike.interface";
import { stripe } from "../../config";
import QueryBuilder from "../../builder/QueryBuilder";

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

const getRentalsByUserFRomDb = async (
  query: Record<string, unknown>,
  userId: string
) => {
  const rentalsQuery = new QueryBuilder(
    RentalModel.find({ userId: userId }).populate("userId").populate("bikeId"),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await rentalsQuery.modelQuery;
  const meta = await rentalsQuery.countTotal();

  return {
    meta,
    result,
  };
};

const updateRentalPaymentStatus = async ({
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

  const bikeUpdate = await BikeModel.findByIdAndUpdate(
    rental.bikeId,
    { isAvailable: status == "failed" ? false : true },
    { new: true }
  );

  if (!bikeUpdate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Failed to update bike availability"
    );
  }

  return rental;
};

const calculateRentalCost = async (id: string, endTime: Date) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const rental = await RentalModel.findById(id)
      .populate<{ bikeId: TBike }>("bikeId")
      .session(session);

    if (!rental) {
      throw new AppError(httpStatus.NOT_FOUND, "Rental not found");
    }

    if (rental.isReturned) {
      throw new AppError(httpStatus.BAD_REQUEST, "Bike is already returned");
    }

    const startTime = new Date(rental.startTime);

    // Calculate the duration in hours
    const duration =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    let totalCost = duration * rental.bikeId.pricePerHour;
    totalCost = Math.ceil(totalCost * 100) / 100; // Round to 2 decimal places

    const updatePayload = {
      returnTime: endTime,
      totalCost: totalCost,
      status: "returned", // Update status to "returned"
      isReturned: true, // Mark as returned
    };

    // Update the rental record
    const updatedRental = await RentalModel.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,
        session,
      }
    );

    if (!updatedRental) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to update rental");
    }

    // Update the bike availability
    const bikeUpdate = await BikeModel.findByIdAndUpdate(
      rental.bikeId,
      { isAvailable: true }, // Make the bike available again
      { new: true, session }
    );

    if (!bikeUpdate) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Failed to update bike availability"
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return updatedRental;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getAllRentalsFromDB = async (query: Record<string, unknown>) => {
  const rentalsQuery = new QueryBuilder(
    RentalModel.find().populate("userId").populate("bikeId"),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await rentalsQuery.modelQuery;
  const meta = await rentalsQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const RentalServices = {
  createRentalIntoDB,
  returnBikeToDB,
  getRentalsByUserFRomDb,
  updateRentalPaymentStatus,
  calculateRentalCost,
  getAllRentalsFromDB,
};
