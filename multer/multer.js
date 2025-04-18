import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { AppError } from "../src/utils/AppError.js";

dotenv.config();

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create Multer Uploader for S3
const createMulterUploader = (folderName) => {
  const storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const cleanName = file.originalname
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_.-]/g, "");

      cb(null, `${folderName}/${uuidv4()}-${cleanName}`);
    },
  });

  function fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new AppError("Not supporting this mimetype", 401), false);
    }
  }

  return multer({ storage, fileFilter });
};

// Single File Upload to S3
export const uploadSingleFile = (fieldName, folderName) => {
  return createMulterUploader(folderName).single(fieldName);
};

// Multiple Files Upload to S3
export const uploadMultipleFiles = (arrayOfFields, folderName) => {
  return createMulterUploader(folderName).fields(arrayOfFields);
};
