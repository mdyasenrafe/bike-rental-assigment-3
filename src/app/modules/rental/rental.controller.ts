import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalServices, updateRentalPaymentStatus } from "./rental.service";

const createRental = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await RentalServices.createRentalIntoDB(
    user?.userId,
    req.body
  );
  sendResponse(res, {
    data: result?.rental,
    clientSecret: result?.clientSecret as string,
    message: "Rental created successfully",
  });
});

const ReturnBike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RentalServices.returnBikeToDB(id);
  sendResponse(res, {
    data: result,
    message: "Bike returned successfully",
  });
});

const getUserRentals = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await RentalServices.getRentalsByUserFRomDb(user?.userId);
  sendResponse(res, {
    data: result,
    message: "Rentals retrieved successfully",
  });
});

export const handleStripeWebhook = catchAsync(async (req, res) => {
  const event = RentalServices.verifyStripeWebhookSignature(req);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      await updateRentalPaymentStatus({
        paymentIntentId: paymentIntent.id,
        status: "succeeded",
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await updateRentalPaymentStatus({
        paymentIntentId: paymentIntent.id,
        status: "failed",
      });
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  sendResponse(res, { message: "Webhook received successfully", data: "" });
});

export const RentalControllers = {
  createRental,
  ReturnBike,
  getUserRentals,
};
