import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { subCategoryModel } from "./../../../Database/models/subcategory.model.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

const addSubCategory = catchAsyncError(async (req, res, next) => {
  const { name, description } = req.body.form;
  const { _id } = req.body.selected;
  const addSubcategory = new subCategoryModel({
    name,
    description,
    category: _id,
  });
  await addSubcategory.save();

  res.status(201).json({ message: "success", addSubcategory });
});

const getSingleSubCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const singleCategory = await subCategoryModel
    .findById(id)
    .populate({ model: "category", path: "category" });

  res.status(201).json({ message: "success", singleCategory });
});

const getAllSubCategories = catchAsyncError(async (req, res, next) => {
  let filterObj = {};

  if (req.params.category) {
    filterObj = { category: req.params.category };
  }
  const apiFeature = new ApiFeatures(
    subCategoryModel
      .find(filterObj)
      .populate({ model: "category", path: "category" }),
    req.query
  ).filteration();

  // Execute the query
  const getAllSubCategories = await apiFeature.mongooseQuery;

  res.status(201).json({ message: "success", getAllSubCategories });
});

const updateSubCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body.form;
  const { _id } = req.body.selected;
  const updateSubCategory = await subCategoryModel.findByIdAndUpdate(
    id,
    { name, description, category: _id },
    {
      new: true,
    }
  );

  updateSubCategory &&
    res.status(201).json({ message: "success", updateSubCategory });

  !updateSubCategory && next(new AppError("subcategory was not found", 404));
});

const deleteSubCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Check if any products are using this subcategory
  const hasProducts = await productModel.exists({ subcategory_id: id });
  if (hasProducts) {
    return next(new AppError("Cannot delete subcategory: Products are linked to this subcategory", 400));
  }

  const subcategory = await subCategoryModel.findById(id);
  if (!subcategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  await subCategoryModel.findByIdAndDelete(id);

  res.status(200).json({ message: "Subcategory deleted successfully" });
});

export {
  addSubCategory,
  getAllSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
