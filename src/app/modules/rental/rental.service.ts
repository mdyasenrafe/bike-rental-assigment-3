import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { BikeModel } from "../bike/bike.model";
import { TRental, TRentalStatusUpdate } from "./rental.interace";
import { RentalModel } from "./rental.model";
import mongoose, { Types } from "mongoose";
import { TBike } from "../bike/bike.interface";
import { stripe } from "../../config";
import { CouponModel } from "../coupon/coupon.model";
import { roundToTwoDecimals } from "../../utils/roundToTwoDecimals";
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

    // Create a PaymentIntent for the advance payment (100 Taka)
    const advancePaymentIntent = await stripe.paymentIntents.create({
      amount: 100 * 100, // Convert Taka to cents
      currency: "bdt",
      payment_method_types: ["card"],
    });

    const bikeUpdate = await BikeModel.findByIdAndUpdate(
      payload.bikeId,
      { isAvailable: false },
      { new: true, session }
    );

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
    console.log(error);
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

    // Calculate the duration in hours and the total cost
    const duration =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    let totalCost = duration * rental.bikeId.pricePerHour;
    totalCost = roundToTwoDecimals(totalCost);

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

const completeRentalInDB = async (id: string, couponCode?: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const rental = await RentalModel.findById(id)
      .populate<{ bikeId: TBike }>("bikeId")
      .populate("userId")
      .session(session);

    if (!rental) {
      throw new AppError(httpStatus.NOT_FOUND, "No Rental Found");
    }

    if (!rental.totalCost || rental.totalCost <= 100) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rental cost has not been calculated or is less than the advance payment"
      );
    }

    let finalAmount = rental.totalCost;

    let discount = 0;
    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode,
        isActive: true,
      }).session(session);

      if (!coupon) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Invalid or inactive coupon"
        );
      }

      if (coupon.discountType === "percentage") {
        discount = roundToTwoDecimals(
          (finalAmount * coupon.discountValue) / 100
        );
      } else if (coupon.discountType === "fixed") {
        discount = roundToTwoDecimals(coupon.discountValue);
      }
      finalAmount = roundToTwoDecimals(finalAmount - discount);
      finalAmount = Math.max(0, finalAmount - 100);
    }

    const finalPaymentIntent = await stripe.paymentIntents.create({
      amount: roundToTwoDecimals(finalAmount * 100),
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
      updatePayload.paymentStatus = status === "succeeded" ? "paid" : "failed";
    }
    console.log(paymentIntentId);
    if (paymentIntentId !== rental.finalPaymentIntentId) {
      const isAvailable = status === "failed" ? true : false;
      console.log("isAvailable =>", isAvailable);
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
    await session.endSession(); // End the session

    return updatedRental;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
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

export const RentalServices = {
  createRentalIntoDB,
  calculateRentalCost,
  completeRentalInDB,
  updateRentalPaymentStatus,
  getAllRentalsFromDB,
  getRentalsByUserFRomDb,
};
