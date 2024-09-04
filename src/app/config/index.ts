import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
