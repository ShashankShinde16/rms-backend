import express from "express";
import * as subCategory from "./subcategory.controller.js";
import { validate } from "./../../middlewares/validate.js";
import {
  addSubCategoryValidation,
  deleteSubCategoryValidation,
  updateSubCategoryValidation,
} from "./subcategory.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import { uploadSingleFile } from "../../../multer/multer.js";

const subCategoryRouter = express.Router({ mergeParams: true });

subCategoryRouter
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("Admin"),
    uploadSingleFile("Image", "subcategory"),
    // validate(addSubCategoryValidation),
    subCategory.addSubCategory
  )
  .get(subCategory.getAllSubCategories);

subCategoryRouter
  .route("/:id")
  .get(protectedRoutes, subCategory.getSingleSubCategory)
  .patch(
    protectedRoutes,
    allowedTo("Admin"),
    uploadSingleFile("Image", "subcategory"),
    // validate(updateSubCategoryValidation),
    subCategory.updateSubCategory
  )
  .delete(
    protectedRoutes,
    allowedTo("Admin"),
    // validate(deleteSubCategoryValidation),
    subCategory.deleteSubCategory
  );

export default subCategoryRouter;
