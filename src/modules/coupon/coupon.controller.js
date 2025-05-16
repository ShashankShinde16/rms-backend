import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { couponModel } from "../../../Database/models/coupon.model.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { userModel } from "../../../Database/models/user.model.js";
import QRCode from "qrcode";

const createCoupon = catchAsyncError(async (req, res, next) => {
  const { couponCode, expires, discount } = req.body;

  const createCoupon = new couponModel({
    code: couponCode,
    expires: new Date(expires),
    discount,
  });

  await createCoupon.save();

  res.status(201).json({ message: "success", createCoupon });
});


const getAllCoupons = catchAsyncError(async (req, res, next) => {
  // let apiFeature = new ApiFeatures(couponModel.find({userId:req.user._id}), req.query)
  //   .fields()
  //   .filteration()
  //   .search()
  //   .sort();
  // const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllCoupons = await userModel.findOne({ _id: req.user._id }).populate("coupon");

  if (!getAllCoupons) {
    return next(new AppError("User not found", 404));
  }


  res
    .status(201)
    .json({message: "success", getAllCoupons });
});

const getAllCouponsToAdmin = catchAsyncError(async (req, res, next) => {
  const getAllCoupons = await couponModel.find({ });

  if (!getAllCoupons) {
    return next(new AppError("User not found", 404));
  }

  res
    .status(201)
    .json({message: "success", getAllCoupons });
});

const getSpecificCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const getSpecificCoupon = await couponModel.findByIdAndUpdate(id);

  let url = await QRCode.toDataURL(getSpecificCoupon.code);

  getSpecificCoupon &&
    res.status(201).json({ message: "success", getSpecificCoupon, url });

  !getSpecificCoupon && next(new AppError("Coupon was not found", 404));
});

const updateCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updateCoupon = await couponModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  updateCoupon && res.status(201).json({ message: "success", updateCoupon });

  !updateCoupon && next(new AppError("Coupon was not found", 404));
});

const getCouponByCode = catchAsyncError(async (req, res, next) => {
  const { code } = req.params;
  const coupon = await couponModel.findOne({ code });

  if (!coupon) return next(new AppError("Invalid coupon code", 404));

  // Check if expired
  const now = new Date();
  if (new Date(coupon.expiresIn) < now) {
    return next(new AppError("Coupon has expired", 400));
  }

  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  // Make sure cart has an original price field
  if (!cart.originalTotalPrice) {
    cart.originalTotalPrice = cart.totalPriceAfterDiscount;  // Initialize only if not set
  }

  // Calculate discount from originalTotalPrice
  let discountAmount = 0;
  if (coupon.discount > 0) {
    discountAmount = parseInt((cart.originalTotalPrice * coupon.discount) / 100);
    cart.totalPriceAfterDiscount = cart.originalTotalPrice - discountAmount;
  }

  // Save applied coupon info (optional)
  cart.appliedCoupon = {
    code: coupon.code,
    discount: coupon.discount,
  };

  await cart.save();

  res.status(200).json({
    message: "success",
    valid: true,
    discountAmount: discountAmount,
    totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
  });
});



const deleteCoupon = deleteOne(couponModel, "Coupon");
export {
  createCoupon,
  getAllCoupons,
  getAllCouponsToAdmin,
  getSpecificCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponByCode,
};
