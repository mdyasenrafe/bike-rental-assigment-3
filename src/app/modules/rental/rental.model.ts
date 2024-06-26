import { Schema, model } from "mongoose";
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
  },
  {
    timestamps: true,
  }
);

export const RentalModel = model<TRental>("rental", rentalSchema);
