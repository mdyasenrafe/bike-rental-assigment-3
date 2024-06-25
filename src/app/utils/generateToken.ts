import jwt from "jsonwebtoken";
import config from "../config";
import { Types } from "mongoose";

export const generateToken = (id: Types.ObjectId, email: string): string => {
  const token = jwt.sign(
    { userId: id, email: email },
    config.access_token_secret as string,
    { expiresIn: "60d" }
  );
  return token;
};
