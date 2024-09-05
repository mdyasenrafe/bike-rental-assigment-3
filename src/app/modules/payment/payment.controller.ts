import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalServices } from "../rental/rental.service";
import { PaymentServices } from "./paymentServices";

export const handleStripeWebhook = catchAsync(async (req, res) => {
  const event = PaymentServices.verifyStripeWebhookSignature(req);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      await RentalServices.updateRentalPaymentStatus({
        paymentIntentId: paymentIntent.id,
        status: "succeeded",
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await RentalServices.updateRentalPaymentStatus({
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

export const paymentControllers = {
  handleStripeWebhook,
};
