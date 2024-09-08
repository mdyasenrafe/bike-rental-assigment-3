export type TCoupon = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
  minAmount?: number;
};
