import { Response } from "express";
import httpStatus from "http-status";

type TResponse<T> = {
  message: string;
  data: T;
};

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.send(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: data.message,
    data: data.data,
  });
};
