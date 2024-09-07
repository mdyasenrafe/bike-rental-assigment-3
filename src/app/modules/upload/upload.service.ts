import config from "../../config";
import { TUpload } from "./upload.interface";
const imgbbUploader = require("imgbb-uploader");

const uploadImageToImgBB = async (payload: TUpload) => {
  const uploadOptions = {
    apiKey: config.imgbb_api_key,
    base64string: payload.url,
  };
  try {
    const uploadResponse = await imgbbUploader(uploadOptions);
    return uploadResponse;
  } catch (err) {
    console.log(err);
  }
};

export const uploadServices = {
  uploadImageToImgBB,
};
