import express from "express";
import * as brand from "./brand.controller.js";
import { validate } from "./../../middlewares/validate.js";
import {
  addBrandValidation,
  deleteBrandValidation,
  updateBrandValidation,
} from "./brand.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import { uploadSingleFile } from "../../../multer/multer.js";

const brandRouter = express.Router();

brandRouter
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("Admin", "user"),
    uploadSingleFile("logo", "brand"),
    // validate(addBrandValidation),
    brand.addBrand
  )
  .get(brand.getAllBrands);

brandRouter
  .route("/:id")
  .get(brand.getSingleBrand)
  .patch(
    protectedRoutes,
    allowedTo("Admin"),
    uploadSingleFile("logo", "brand"),
    // validate(updateBrandValidation),
    brand.updateBrand
  )
  .delete(
    protectedRoutes,
    allowedTo("Admin"),
    // validate(deleteBrandValidation),
    brand.deleteBrand
  );

export default brandRouter;
