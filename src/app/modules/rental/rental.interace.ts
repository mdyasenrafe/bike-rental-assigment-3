import { Types } from "mongoose";

export type TRental = {
  userId: Types.ObjectId;
  bikeId: Types.ObjectId;
  startTime: Date;
  returnTime: Date;
  totalCost: number;
  isReturned: boolean;
  status: "booked" | "returned" | "completed";
  paymentStatus: "pending" | "paid" | "failed";
};

export interface TRentalStatusUpdate {
  paymentIntentId: string;
  status: "succeeded" | "failed";
}
