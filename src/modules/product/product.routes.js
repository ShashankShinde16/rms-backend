import express from "express";
import * as product from "./product.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  addProductValidation,
  deleteProductValidation,
  getSpecificProductValidation,
  updateProductValidation,
  getProductsByCategoryValidation,
} from "./product.validation.js";
import {
  uploadMultipleFiles,
  uploadSingleFile,
} from "../../../multer/multer.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const productRouter = express.Router();

let arrFields = [
  { name: "imgCover", maxCount: 1 },
  { name: "images", maxCount: 20 },
];

productRouter
  .route("/upload-image")
  .post(
    protectedRoutes,
    allowedTo("Admin"),
    uploadSingleFile("image", "products"),
    product.uploadProductImage
  );
productRouter
  .route("/delete-image")
  .post(protectedRoutes, allowedTo("Admin"), product.deleteProductImage);

productRouter
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("Admin"),
    // uploadMultipleFiles(arrFields, "products"),
    // validate(addProductValidation),
    product.addProduct
  )
  .get(product.getAllProducts);

productRouter.get("/search", product.searchProducts);

productRouter
  .route("/:id")
  .patch(
    protectedRoutes,
    allowedTo("Admin"),
    // validate(updateProductValidation),
    product.updateProduct
  )
  .delete(
    protectedRoutes,
    allowedTo("Admin"),
    validate(deleteProductValidation),
    product.deleteProduct
  )
  .get(validate(getSpecificProductValidation), product.getSpecificProduct);

productRouter
  .route("/category/:categoryId")
  .get(
    // protectedRoutes,
    // allowedTo("Admin", "user"),
    // validate(getProductsByCategoryValidation),
    product.getProductsByCategory);

productRouter
  .route("/brand/:brandName")
  .get(
    // protectedRoutes,
    // allowedTo("Admin", "user"),
    // validate(getProductsByBrandValidation),
    product.getProductsByBrand);


export default productRouter;
