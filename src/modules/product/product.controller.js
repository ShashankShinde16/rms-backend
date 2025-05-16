import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { productModel } from "./../../../Database/models/product.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import dotenv, { configDotenv } from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { brandModel } from "../../../Database/models/brand.model.js";
import { fabricModel } from "../../../Database/models/fabric.model.js";
import { categoryModel } from "../../../Database/models/category.model.js";
import { subCategoryModel } from "../../../Database/models/subcategory.model.js";

dotenv.config();

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const addProduct = catchAsyncError(async (req, res, next) => {
  // console.log(req.body);
  // return;
  const { name, description, gender, basePrice, fabric, sleeve, } = req.body.product;
  const { variations, brand_id, category_id, subcategory_id } = req.body;

    // 🧵 Add fabric to fabricModel if it doesn't exist
    if (fabric && fabric.trim()) {
      await fabricModel.updateOne(
        { name: fabric.trim() },
        { $setOnInsert: { name: fabric.trim() } },
        { upsert: true }
      );
    }

  const addProduct = new productModel({
    name,
    description,
    gender,
    basePrice,
    sleeve,
    fabric,
    variations,
    category_id,
    subcategory_id,
    brand_id,
  });
  await addProduct.save();

  res.status(201).json({ message: "success", addProduct });
});

const getAllProducts = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(
    productModel
      .find()
      .populate({ model: "category", path: "category_id" })
      .populate({ model: "subcategory", path: "subcategory_id" })
      .populate({ model: "brand", path: "brand_id" }),

    req.query
  )
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllProducts = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllProducts });
});

const getSpecificProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const getSpecificProduct = await productModel
    .findByIdAndUpdate(id)
    .populate({ model: "category", path: "category_id" })
    .populate({ model: "subcategory", path: "subcategory_id" })
    .populate({ model: "brand", path: "brand_id" });
  res.status(201).json({ message: "success", getSpecificProduct });
});

const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, gender, basePrice, fabric, sleeve, } = req.body.product;
  const { variations, brand_id, category_id, subcategory_id } = req.body;

    // 🧵 Ensure fabric is in the fabric table
    if (fabric && fabric.trim()) {
      await fabricModel.updateOne(
        { name: fabric.trim() },
        { $setOnInsert: { name: fabric.trim() } },
        { upsert: true }
      );
    }

  const updateProduct = await productModel.findByIdAndUpdate(
    id,
    {
      name,
      description,
      gender,
      basePrice,
      sleeve,
      fabric,
      variations,
      category_id,
      subcategory_id,
      brand_id,
    },
    {
      new: true,
    }
  );

  updateProduct && res.status(201).json({ message: "success", updateProduct });

  !updateProduct && next(new AppError("Product was not found", 404));
});

const deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Find the product by ID
  const product = await productModel.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Extract image URLs from variations or other fields
  const imageUrls = product.variations?.flatMap(v => v.images) || [];

  if (imageUrls.length > 0) {
    try {
      // Extract S3 keys from URLs
      const deleteObjects = imageUrls.map((imageUrl) => {
        const url = new URL(imageUrl);
        return { Key: decodeURIComponent(url.pathname.substring(1)) };
      });

      // Delete all images from S3
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: { Objects: deleteObjects },
      };

      await s3.send(new DeleteObjectCommand(deleteParams));

      console.log("Product images deleted from S3");
    } catch (error) {
      console.error("Error deleting product images from S3:", error);
    }
  }

  // Delete product from DB
  await productModel.findByIdAndDelete(id);

  return res.status(200).json({ message: "Product and images deleted successfully" });
});


const uploadProductImage = catchAsyncError(async (req, res) => {
  try {
    return res
      .status(200)
      .json({ path: req.file.location });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ mssg: "Error uploading Image", detail: error });
  }
});

const deleteProductImage = catchAsyncError(async (req, res) => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({ mssg: "No image URL provided" });
    }

    // If `imagePath` is already an S3 key, use it directly.
    const key = decodeURIComponent(imagePath.split(".amazonaws.com/")[1]);

    if (!key) {
      return res.status(400).json({ mssg: "Invalid image path" });
    }

    console.log(`Deleting image from S3: ${key}`);

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));

    return res.status(200).json({ mssg: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ mssg: "Error deleting image", detail: error });
  }
});

const getFabric = catchAsyncError(async (req, res, next) => {
  const fabrics = await fabricModel.find();
  if (!fabrics) {
    return next(new AppError("No fabrics found", 404));
  }
  res.status(200).json({ message: "success", fabrics });
});


const getProductsByCategory = catchAsyncError(async (req, res, next) => {
  const { categoryId } = req.params;
  
  // Fetch products that match the category_id
  const products = await productModel
    .find({ category_id: categoryId })
    .populate({ model: "category", path: "category_id" })
    .populate({ model: "subcategory", path: "subcategory_id" })
    .populate({ model: "brand", path: "brand_id" });

  if (!products.length) {
    return next(new AppError("No products found for this category", 404));
  }

  res.status(200).json({ message: "success", products });
});


const getProductsByBrand = catchAsyncError(async (req, res, next) => {
  const { brandName } = req.params;

  // Find brand by name
  const brand = await brandModel
  .findOne({ name: brandName })
  
  console.log(brand);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  // Fetch products associated with this brand
  const products = await productModel
    .find({ brand_id: brand._id })
    .populate({ model: "category", path: "category_id" })
    .populate({ model: "subcategory", path: "subcategory_id" })
    .populate({ model: "brand", path: "brand_id" });

  if (!products.length) {
    return next(new AppError("No products found for this brand", 404));
  }

  res.status(200).json({ message: "success", products });
});

const searchProducts = catchAsyncError(async (req, res, next) => {
    const query = req.query.q || "";

    const products = await productModel
      .find({
        deleted: false,
      })
      .populate("category_id", "name")
      .populate("subcategory_id", "name");

    // Filter on product name, category name, or subcategory name
    const filtered = products.filter((product) => {
      const q = query.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.category_id?.name.toLowerCase().includes(q) ||
        product.subcategory_id?.name.toLowerCase().includes(q)
      );
    });
    res.status(200).json({ message: "success", products: filtered });
});

const searchSuggestions = catchAsyncError(async (req, res, next) => {
  const query = req.query.q || "";

  if (!query) {
    return res.status(200).json({ suggestions: [] });
  }

  const q = query.toLowerCase();

  // Fetch products matching query
  const products = await productModel.find({
    name: { $regex: q, $options: "i" },
    deleted: false,
  }).select("name");

  // Fetch categories matching query
  const categories = await categoryModel.find({
    name: { $regex: q, $options: "i" },
  }).select("name");

  // Fetch subcategories matching query
  const subcategories = await subCategoryModel.find({
    name: { $regex: q, $options: "i" },
  }).select("name");

  // Prepare combined suggestions
  const suggestions = [
    ...products.map(p => ({ type: "product", name: p.name })),
    ...categories.map(c => ({ type: "category", name: c.name })),
    ...subcategories.map(sc => ({ type: "subcategory", name: sc.name })),
  ];

  res.status(200).json({ suggestions });
});


export {
  addProduct,
  getAllProducts,
  getSpecificProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  getFabric,
  getProductsByCategory,
  getProductsByBrand,
  searchProducts,
  searchSuggestions,
};
