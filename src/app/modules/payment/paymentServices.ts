import { stripe } from "../../config";

export const verifyStripeWebhookSignature = (req: any) => {
  const sig = req.headers["stripe-signature"] as string;
  console.log(
    "process.env.STRIPE_WEBHOOK_SECRET =>",
    process.env.STRIPE_WEBHOOK_SECRET
  );
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  return event;
};

export const PaymentServices = {
  verifyStripeWebhookSignature,
};
