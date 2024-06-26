import { NextFunction, Request, Response } from "express";
import { TErrorSources } from "../types/error";
import { ZodError } from "zod";
import { handleZodError } from "../errors/handleZodError";
import { handleValidationError } from "../errors/handleValidationError";
import { handleDuplicateError } from "./handleDuplicateError";
import { handleCastError } from "../errors/handleCastError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 400;
  let message = err.message || "Something went wrong!";
  let errorSources: TErrorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message,
    errorMessages: errorSources,
    stack: err?.stack,
  });
};
