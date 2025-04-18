import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { couponModel } from "../../../Database/models/coupon.model.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import QRCode from "qrcode";

const createCoupon = catchAsyncError(async (req, res, next) => {
  const createCoupon = new couponModel(req.body);
  await createCoupon.save();

  res.status(201).json({ message: "success", createCoupon });
});

const getAllCoupons = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(couponModel.find(), req.query)
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllCoupons = await apiFeature.mongooseQuery;

  res
    .status(201)
    .json({ page: PAGE_NUMBER, message: "success", getAllCoupons });
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

  // Optional: check if expired or usage limit exceeded
  const now = new Date();
  if (new Date(coupon.expiresIn) < now) {
    return next(new AppError("Coupon has expired", 400));
  }

  const cart = await cartModel.findOne({ userId: req.user._id });
  if (!cart) return next(new AppError("Cart not found", 404));

  // Apply coupon discount
  cart.discount = coupon.discount;
  let afterDiscount = 0
    // Then apply coupon discount
    if (cart.discount > 0) {
      afterDiscount = parseInt((cart.totalPriceAfterDiscount * cart.discount) / 100);
      cart.totalPriceAfterDiscount = parseInt(
        cart.totalPriceAfterDiscount - (cart.totalPriceAfterDiscount * cart.discount) / 100
      );
    }
  
    await cart.save();

  res.status(200).json({
    message: "success",
    valid: true,
    discountAmount: afterDiscount, // Adjust logic as per your model
  });
});


const deleteCoupon = deleteOne(couponModel, "Coupon");
export {
  createCoupon,
  getAllCoupons,
  getSpecificCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponByCode,
};
