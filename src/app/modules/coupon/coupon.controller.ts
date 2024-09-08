import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { couponServices } from "./coupon.service";

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

export const CouponControllers = {
  validateCoupon,
};
