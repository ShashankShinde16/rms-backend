import Razorpay from "razorpay";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "../../utils/resendClient.js";

import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { orderModel } from "../../../Database/models/order.model.js";
import { userModel } from "../../../Database/models/user.model.js";


// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_OKMfqngoXdr6jk",
  key_secret: "FrIlngbTMzaVXLnUKdp4OtiK",
});

// Create Razorpay Order
const createCheckOutSession = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));
  
  const totalOrderPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
  
  const options = {
    amount: Math.ceil(totalOrderPrice * 100), // Razorpay expects amount in paise
    currency: "INR",
    receipt: `order_rcptid_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
      shippingAddress: JSON.stringify(req.body.shippingAddress),
    },
  };
  
  console.log(options);
  const order = await razorpay.orders.create(options);

  res.status(200).json({
    message: "success",
    order,
  });
});

// Verify Razorpay Signature and create order
const createOnlineOrder = catchAsyncError(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cartId,
    shippingAddress,
  } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return next(new AppError("Payment verification failed", 400));
  }

  const cart = await cartModel.findById(cartId).populate("cartItem.productId");
  console.log(cart);
  if (!cart) return next(new AppError("Cart not found", 404));

  const order = new orderModel({
    userId: req.user._id,
    cartItems: cart.cartItem,
    totalOrderPrice: cart.totalPriceAfterDiscount || cart.totalPrice,
    shippingAddress,
    paymentMethod: "razorpay",
    isPaid: true,
    paidAt: Date.now(),
  });

  console.log("Order created:", order);

  await order.save();

  const user = await userModel.findById(req.user._id);
  
  await sendOrderConfirmationEmail({
    to: user.email,
    name: user.name,
    orderId: order._id,
  });

  console.log("Email sent to:", user.email);

  // Update product stock
  for (const item of cart.cartItem) {
    const product = await productModel.findById(item.productId);
    if (!product) continue;
  
    let found = false;
  
    for (const variation of product.variations) {
      const sizeOption = variation.sizes.find(
        (size) => size._id.toString() === item.variationId.toString()
      );
  
      if (sizeOption) {
        sizeOption.stock -= item.quantity;
        if (sizeOption.stock < 0) sizeOption.stock = 0;
        found = true;
        break; // no need to continue once found
      }
    }
  
    if (found) {
      await product.save();
    }
  }

  await cartModel.findByIdAndDelete(cartId);

  res.status(201).json({ message: "success", order });
});

// Other unchanged endpoints
const createCashOrder = catchAsyncError(async (req, res, next) => {
  const cart = await cartModel.findById(req.params.id);
  if (!cart) return next(new AppError("Cart not found", 404));

  const totalOrderPrice = cart.totalPriceAfterDiscount || cart.totalPrice;

  const order = new orderModel({
    userId: req.user._id,
    cartItems: cart.cartItem,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  await order.save();

  const options = cart.cartItem.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
    },
  }));

  await productModel.bulkWrite(options);
  await cartModel.findByIdAndDelete(req.params.id);

  res.status(201).json({ message: "success", order });
});

const getSpecificOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel
    .findOne({ userId: req.user._id })
    .populate("cartItems.productId");
  res.status(200).json({ message: "success", order });
});

const getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await orderModel
    .find({})
    .populate("cartItems.productId")
    .populate("userId", "name");

  const ordersWithCartPrice = await Promise.all(
    orders.map(async (order) => {
      const cart = await cartModel.findOne({ userId: order.userId });
      console.log(cart);
      return {
        ...order.toObject(),
        cartTotalPrice: cart?.totalPrice || 0,
      };
    })
  );

  res.status(200).json({ message: "success", orders: ordersWithCartPrice });
});

const markOrderAsDelivered = async (req, res) => {
  const { id } = req.params;

  const order = await orderModel.findById(id);
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  order.isDelivered = true;
  order.deliveredAt = new Date();

  await order.save();

  res.status(200).json({ msg: "Order marked as delivered", order });
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ msg: "Order is already cancelled" });
    }

    if (order.isDelivered) {
      return res.status(400).json({ msg: "Cannot cancel a delivered order" });
    }

    order.status = 'cancelled';
    order.isDelivered = false;
    order.isPaid = false;
    await order.save();

    res.status(200).json({ msg: "Order cancelled successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong" });
  }
};



export {
  createCashOrder,
  getSpecificOrder,
  getAllOrders,
  createCheckOutSession,
  createOnlineOrder,
  markOrderAsDelivered,
};
