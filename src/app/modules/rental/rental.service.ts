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

    const advancePaymentIntent = await stripe.paymentIntents.create({
      amount: 100 * 100,
      currency: "bdt",
      payment_method_types: ["card"],
    });

    const rentalResult = await RentalModel.create(
      [
        {
          ...payload,
          advancePaymentIntentId: advancePaymentIntent.id,
          advancePaymentStatus: "pending",
          paymentStatus: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    await session.endSession();

    return {
      rental: rentalResult,
      clientSecret: advancePaymentIntent.client_secret,
    };
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error);
  }
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

    const duration =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    let totalCost = duration * rental.bikeId.pricePerHour;
    totalCost = Math.ceil(totalCost * 100) / 100;

    const updatePayload = {
      returnTime: endTime,
      totalCost: totalCost,
      status: "returned",
      isReturned: true,
    };

    const updatedRental = await RentalModel.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, session }
    );

    if (!updatedRental) {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to update rental");
    }

    const bikeUpdate = await BikeModel.findByIdAndUpdate(
      rental.bikeId,
      { isAvailable: true },
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

const completeRentalInDB = async (id: string) => {
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

    if (!rental.totalCost || rental.totalCost <= 100) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rental cost has not been calculated or is less than the advance payment"
      );
    }

    const finalAmount = rental.totalCost - 100;

    const finalPaymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount * 100,
      currency: "bdt",
      payment_method_types: ["card"],
    });

    const updatedRental = await RentalModel.findByIdAndUpdate(
      id,
      {
        finalPaymentIntentId: finalPaymentIntent.id,
        finalPaymentStatus: "pending",
      },
      { new: true, session }
    );

    await session.commitTransaction();
    await session.endSession();

    return {
      rental: updatedRental,
      clientSecret: finalPaymentIntent.client_secret,
    };
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, error);
  }
};
const updateRentalPaymentStatus = async ({
  paymentIntentId,
  status,
}: TRentalStatusUpdate) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const rental = await RentalModel.findOne({
      $or: [
        { advancePaymentIntentId: paymentIntentId },
        { finalPaymentIntentId: paymentIntentId },
      ],
    }).session(session);

    if (!rental) {
      throw new AppError(httpStatus.NOT_FOUND, "No Rental Found");
    }

    const updatePayload: Partial<TRental> = {};

    if (rental.advancePaymentIntentId === paymentIntentId) {
      updatePayload.advancePaymentStatus =
        status === "succeeded" ? "paid" : "failed";
      updatePayload.status = "booked";
    }

    if (rental.finalPaymentIntentId === paymentIntentId) {
      updatePayload.finalPaymentStatus =
        status === "succeeded" ? "paid" : "failed";
      updatePayload.status = status === "succeeded" ? "completed" : "returned";
    }

    if (paymentIntentId !== rental.finalPaymentIntentId) {
      const isAvailable = status === "failed" ? true : false;
      await BikeModel.findByIdAndUpdate(
        rental.bikeId,
        { isAvailable },
        { new: true, session }
      );
    }

    const updatedRental = await RentalModel.findByIdAndUpdate(
      rental._id,
      updatePayload,
      { new: true, session }
    );

    if (!updatedRental) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Failed to update rental record"
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return updatedRental;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
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
  updateRentalPaymentStatus,
  calculateRentalCost,
  completeRentalInDB,
  getRentalsByUserFRomDb,
  getAllRentalsFromDB,
};
