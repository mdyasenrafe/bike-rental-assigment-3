import { Schema, model } from "mongoose";
import { PaymentStatuses, RentalStatuses } from "./rental.constant";
import { TRental } from "./rental.interace";

const rentalSchema = new Schema<TRental>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    bikeId: {
      type: Schema.Types.ObjectId,
      ref: "bike",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    returnTime: { type: Date },
    totalCost: { type: Number, default: 0 },
    isReturned: {
      type: Boolean,
      default: false,
    },
    advancePaymentIntentId: {
      type: String,
    },
    finalPaymentIntentId: {
      type: String,
    },
    advancePaymentStatus: {
      type: String,
      enum: PaymentStatuses,
      default: "pending",
    },
    finalPaymentStatus: {
      type: String,
      enum: PaymentStatuses,
      default: "pending",
    },
    status: {
      type: String,
      enum: RentalStatuses,
      default: "booked",
    },
    paymentStatus: {
      type: String,
      enum: PaymentStatuses,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const RentalModel = model<TRental>("rental", rentalSchema);
