import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { uploadServices } from "./upload.service";

const uploadImage = catchAsync(async (req, res) => {
  const result = await uploadServices.uploadImageToImgBB(req.body);
  sendResponse(res, {
    data: result,
    message: "upload image succesfully",
  });
});

export const uploadControllers = {
  uploadImage,
};
