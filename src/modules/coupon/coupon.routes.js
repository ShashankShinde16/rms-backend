import express from "express";
import * as coupon from "./coupon.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  createCouponValidation,
  deleteCouponValidation,
  getSpecificCouponValidation,
  updateCouponValidation,
} from "./coupon.validation.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const couponRouter = express.Router();

couponRouter
  .route("/")
  .post(
    protectedRoutes,
    // allowedTo("user", "Admin"),
    // validate(createCouponValidation),
    coupon.createCoupon
  )
  .get(protectedRoutes, allowedTo("user"), coupon.getAllCoupons);

couponRouter.get("/admin", protectedRoutes, allowedTo("Admin"), coupon.getAllCouponsToAdmin);

couponRouter
  .route("/:id")
  .put(
    protectedRoutes,
    allowedTo("Admin", "user"),
    validate(updateCouponValidation),
    coupon.updateCoupon
  )
  .delete(
    protectedRoutes,
    allowedTo("user", "Admin"),
    validate(deleteCouponValidation),
    coupon.deleteCoupon
  )
  .get(validate(getSpecificCouponValidation), coupon.getSpecificCoupon);

  couponRouter.get("/apply/:code",
    protectedRoutes,
    allowedTo("user", "Admin"), 
    coupon.getCouponByCode);

export default couponRouter;
