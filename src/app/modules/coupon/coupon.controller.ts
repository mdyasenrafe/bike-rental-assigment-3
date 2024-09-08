import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { couponServices } from "./coupon.service";

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponServices.createCoupon(req.body);

  sendResponse(res, {
    data: coupon,
    message: "Coupon created successfully",
  });
});

const validateCoupon = catchAsync(async (req, res) => {
  const { couponCode, totalAmount } = req.body;

  const { discount, finalAmount } = await couponServices.validateCoupon(
    couponCode,
    totalAmount
  );

  sendResponse(res, {
    data: { discount, finalAmount },
    message: "Coupon applied successfully",
  });
});

const getCoupons = catchAsync(async (req, res) => {
  const { result, meta } = await couponServices.getCouponsFromDB(req.query);

  sendResponse(res, {
    data: result,
    meta: meta,
    message: "Coupons retrieved successfully",
  });
});

export const CouponControllers = {
  validateCoupon,
  createCoupon,
  getCoupons,
};
