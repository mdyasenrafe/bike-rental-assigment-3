import { Schema, model } from "mongoose";
import { TBike } from "./bike.interface";
import { BikeStatusArray } from "./bike.constant";

const bikeSchema = new Schema<TBike>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    cc: {
      type: Number,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    thumb: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: BikeStatusArray,
    },
  },
  {
    timestamps: true,
  }
);

export const BikeModel = model<TBike>("bike", bikeSchema);
