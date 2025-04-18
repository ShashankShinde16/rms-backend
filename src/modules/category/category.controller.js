import slugify from "slugify";
import { categoryModel } from "./../../../Database/models/category.model.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
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


const addCategory = catchAsyncError(async (req, res, next) => {
  req.body.Image = req.file.location;
  const addcategory = new categoryModel(req.body);
  await addcategory.save();

  res.status(201).json({ message: "success", addcategory });
});

const getSingleCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const singleCategory = await categoryModel.findById(id);

  res.status(201).json({ message: "success", singleCategory });
});

const getAllCategories = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(categoryModel.find(), req.query)
    .fields()
    .filteration()
    .search()
    .sort();
  console.log(apiFeature.mongooseQuery);
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  let getAllCategories = await apiFeature.mongooseQuery;
  // getAllCategories = getAllCategories.map((element)=>{
  //   element.Image = `http://localhost:3000/category/${element.Image}`
  //   return element
  // })

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllCategories });
});

const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const cat = await categoryModel.findById(id);
  let imgUrl = cat.Image; // Default to existing image

  if (req.file?.location) {
    await deleteS3File(cat.Image); // Delete old image from S3
    imgUrl = req.file.location; // Update with new S3 file URL
  }
  
  const updateCategory = await categoryModel.findByIdAndUpdate(
    id,
    { name, description, Image: imgUrl },
    {
      new: true,
    }
  );

  updateCategory &&
    res.status(201).json({ message: "success", updateCategory });

  !updateCategory && next(new AppError("category was not found", 404));
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

const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Check if any products are using this category
  const hasProducts = await productModel.exists({ category_id: id });
  if (hasProducts) {
    return next(new AppError("Cannot delete category: Products are linked to this category", 400));
  }

  const category = await categoryModel.findById(id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  if (category.Image) {
    await deleteS3File(category.Image);
  }

  await categoryModel.findByIdAndDelete(id);

  res.status(200).json({ message: "Category deleted successfully" });
});


export {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getSingleCategory,
};
