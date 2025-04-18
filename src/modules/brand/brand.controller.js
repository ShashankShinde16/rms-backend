import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { brandModel } from "./../../../Database/models/brand.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const addBrand = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  // Use S3 file URL instead of local filename
  req.body.logo = req.file.location; // req.file.filename;
  const addBrand = new brandModel(req.body);
  await addBrand.save();

  res.status(201).json({ message: "success", addBrand });
});

const getSingleBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const singleBrand = await brandModel.findById(id);

  res.status(201).json({ message: "success", singleBrand });
});

const getAllBrands = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(brandModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllBrands = await apiFeature.mongooseQuery;

  res.status(201).json({ page: PAGE_NUMBER, message: "success", getAllBrands });
});

const updateBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const brand = await brandModel.findById(id);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  let logoUrl = brand.logo; // Default to existing logo

  if (req.file?.location) {
    await deleteS3File(brand.logo); // Delete old image from S3
    logoUrl = req.file.location; // Update with new S3 file URL
  }

  const updatedBrand = await brandModel.findByIdAndUpdate(
    id,
    { name, logo: logoUrl },
    { new: true }
  );

  res.status(200).json({ message: "success", brand: updatedBrand });
});

const deleteS3File = async (fileUrl) => {
  if (!fileUrl) return;

  // Extract file key from URL (bucket-name/path-to-file)
  const key = fileUrl.split(".amazonaws.com/")[1];

  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`Deleted: ${key}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
};

const deleteBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const brand = await brandModel.findById(id);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  if (brand.logo) {
    await deleteS3File(brand.logo);
  }

  await productModel.deleteMany({ brand_id: id });

  await brandModel.findByIdAndDelete(id);

  res.status(200).json({ message: "Brand deleted successfully" });
});

export { addBrand, getAllBrands, updateBrand, deleteBrand, getSingleBrand };
