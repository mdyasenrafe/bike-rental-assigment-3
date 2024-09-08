import { CouponModel } from "./coupon.model";
import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { roundToTwoDecimals } from "../../utils/roundToTwoDecimals";

const validateCoupon = async (couponCode: string, totalAmount: number) => {
  const coupon = await CouponModel.findOne({
    code: couponCode,
    isActive: true,
  });

  if (!coupon) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or inactive coupon");
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = roundToTwoDecimals((totalAmount * coupon.discountValue) / 100);
  } else if (coupon.discountType === "fixed") {
    discount = roundToTwoDecimals(coupon.discountValue);
  }

  const finalAmount = roundToTwoDecimals(Math.max(0, totalAmount - discount));

  return { discount, finalAmount };
};

export const couponServices = {
  validateCoupon,
};
