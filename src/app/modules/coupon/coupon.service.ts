import { CouponModel } from "./coupon.model";
import httpStatus from "http-status";
import { AppError } from "../../errors/appError";
import { roundToTwoDecimals } from "../../utils/roundToTwoDecimals";
import { TCoupon } from "./coupon.interface";
import QueryBuilder from "../../builder/QueryBuilder";

const createCoupon = async (couponData: TCoupon) => {
  const coupon = await CouponModel.create(couponData);
  return coupon;
};

const validateCoupon = async (couponCode: string, totalAmount: number) => {
  const coupon = await CouponModel.findOne({
    code: couponCode,
  });

  if (!coupon) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid coupon code");
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

const getCouponsFromDB = async (query: Record<string, unknown>) => {
  const couponsQuery = new QueryBuilder(CouponModel.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await couponsQuery.modelQuery;
  const meta = await couponsQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const couponServices = {
  validateCoupon,
  createCoupon,
  getCouponsFromDB,
};
