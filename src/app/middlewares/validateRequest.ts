import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const res = await schema.parseAsync(req.body);
      console.log("next =>", res);
      next();
    } catch (err) {
      next(err);
    }
  };
};
