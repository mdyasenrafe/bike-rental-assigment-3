export type TBike = {
  name: string;
  description: string;
  pricePerHour: number;
  isAvailable: boolean;
  cc: number;
  year: number;
  model: string;
  brand: string;
  thumb: string;
  status: "active" | "inactive";
};

export type OptionType = { value: string; label: string };
