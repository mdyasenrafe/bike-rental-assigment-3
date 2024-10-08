import { Request } from "express";
import { stripe } from "../../config";

export const verifyStripeWebhookSignature = (req: Request) => {
  const sig = req.headers["stripe-signature"] as string;
  console.log(req);
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  return event;
};

export const PaymentServices = {
  verifyStripeWebhookSignature,
};
