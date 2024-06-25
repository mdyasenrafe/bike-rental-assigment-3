import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 400;
  let message = err.message || "Something went wrong!";
  res.status(statusCode).json({
    success: false,
    message,
  });
};
