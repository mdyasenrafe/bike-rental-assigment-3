import { z } from "zod";

const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  discountType: z
    .enum(["percentage", "fixed"])
    .refine((val) => ["percentage", "fixed"].includes(val), {
      message: "Discount type must be either 'percentage' or 'fixed'",
    }),
  discountValue: z
    .number()
    .positive("Discount value must be a positive number")
    .min(0, "Discount value must be at least 0"),
  isActive: z.boolean().optional(),
});

const validateCouponSchema = z.object({
  couponCode: z.string().min(1, "Coupon code is required"),
  totalAmount: z
    .number()
    .positive("Total amount must be a positive number")
    .min(0, "Total amount must be at least 0"),
});

export const CouponValidationSchema = {
  createCouponSchema,
  validateCouponSchema,
};
