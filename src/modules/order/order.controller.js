import Razorpay from "razorpay";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "../../utils/resendClient.js";
import { sendOrderDeliveredEmail } from "../../utils/resendClient.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { cartModel } from "../../../Database/models/cart.model.js";
import { productModel } from "../../../Database/models/product.model.js";
import { orderModel } from "../../../Database/models/order.model.js";
import { userModel } from "../../../Database/models/user.model.js";
import { couponModel } from "../../../Database/models/coupon.model.js";
import moment from 'moment/moment.js';
import dotenv from "dotenv";
dotenv.config();
import twilio from "twilio";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

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

  const messageBody = `
Hi ${user.name},
Thank you for your purchase!
Your order (${order._id}) has been successfully placed.
We'll notify you once it's shipped.
- Your Store Team
  `.trim();

  await client.messages.create({
    body: messageBody,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${user.addresses[0].phone}`, // Or any phone number you want to send to
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

  // ✅ Give Random Coupon to User
  const couponCount = await couponModel.countDocuments();
  if (couponCount > 0) {
    const randomIndex = Math.floor(Math.random() * couponCount);
    const randomCoupon = await couponModel.findOne().skip(randomIndex);

    if (randomCoupon) {
      const coupons = await userModel.findByIdAndUpdate(req.user._id, {
        $addToSet: { coupon: randomCoupon._id }, // prevent duplicates
      });

      console.log(`Coupon ${randomCoupon.code} given to user ${user.email}`);
    }
  }

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

  // ✅ Give Random Coupon to User
  const couponCount = await couponModel.countDocuments();
  if (couponCount > 0) {
    const randomIndex = Math.floor(Math.random() * couponCount);
    const randomCoupon = await couponModel.findOne().skip(randomIndex);

    if (randomCoupon) {
      await userModel.findByIdAndUpdate(req.user._id, {
        $addToSet: { coupons: randomCoupon._id }, // prevent duplicates
      });

      console.log(`Coupon ${randomCoupon.code} given to user ${user.email}`);
    }
  }

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

const markOrderAsDelivered = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const order = await orderModel.findById(id).populate('userId'); // populate user data
  if (!order) {
    return res.status(404).json({ msg: "Order not found" });
  }

  // Mark as Delivered
  order.isDelivered = true;
  order.deliveredAt = new Date();
  await order.save();

  const user = order.userId; // populated user data

  await sendOrderDeliveredEmail({
    to: user.email,
    name: user.name,
    orderId: order._id,
  });

  if (user?.addresses?.length > 0) {
    const messageBody = `
Hi ${user.name},
Good news! Your order (${order._id}) has been delivered.
Thank you for shopping with us.
- Your Store Team
    `.trim();

    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
      await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${user.addresses[0].phone}`,
      });
    } catch (err) {
      console.error('Failed to send delivery SMS:', err.message);
    }
  }

  res.status(200).json({ msg: "Order marked as delivered", order });
});


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


// Dashboard
const getDashboardInfo = catchAsyncError(async (req, res, next) => {
  const { from, to } = req.query;

  const today = moment().startOf('day');
  const yesterday = moment().subtract(1, 'day').startOf('day');
  const startOfMonth = moment().startOf('month');
  const startOfLastMonth = moment().subtract(1, 'month').startOf('month');
  const endOfLastMonth = moment().subtract(1, 'month').endOf('month');
  const startOfWeek = moment().startOf('week');

  // Filters for optional from/to
  const dateFilter = {};
  if (from) dateFilter.$gte = moment(from).startOf('day').toDate();
  if (to) dateFilter.$lte = moment(to).endOf('day').toDate();

  // Today's Sales
  const todaySales = await orderModel.find({ createdAt: { $gte: today.toDate() }, ...dateFilter });

  // Yesterday's Sales
  const yesterdaySales = await orderModel.find({
    paidAt: { $gte: yesterday.toDate(), $lt: today.toDate() },
    ...dateFilter
  });

  // This Month Sales
  const thisMonthSales = await orderModel.find({
    paidAt: { $gte: startOfMonth.toDate() },
    ...dateFilter
  });

  // Last Month Sales
  const lastMonthSales = await orderModel.find({
    paidAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() },
    ...dateFilter
  });

  // This Month Users
  const thisMonthUsers = await userModel.find({
    paidAt: { $gte: startOfMonth.toDate() },
    ...dateFilter
  });

  // Last Month Users
  const lastMonthUsers = await userModel.find({
    paidAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() },
    ...dateFilter
  });

  // Best Selling Product (this month)
  const bestSellingProductAgg = await orderModel.aggregate([
    { $match: { paidAt: { $gte: startOfMonth.toDate() }, ...dateFilter } },
    { $unwind: '$cartItems' },
    { $group: { _id: '$cartItems.productId', count: { $sum: '$cartItems.quantity' } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);


  let bestSellingProduct = { count: 0, startdate: startOfMonth.format(), name: null };

  if (bestSellingProductAgg.length > 0) {
    const productDetails = await productModel.findById(bestSellingProductAgg[0]._id).select('name');

    bestSellingProduct = {
      productId: bestSellingProductAgg[0]._id,
      count: bestSellingProductAgg[0].count,
      startdate: startOfMonth.format(),
      name: productDetails?.name || 'Unknown Product'
    };
  }


  // LineChart: Today & Yesterday All Sales (with amount per order)
  const todayAllSales = await orderModel.find({ paidAt: { $gte: today.toDate() }, ...dateFilter }).select('createdAt totalOrderPrice');
  const yesterdayAllSales = await orderModel.find({
    paidAt: { $gte: yesterday.toDate(), $lt: today.toDate() },
    ...dateFilter
  }).select('createdAt totalOrderPrice');

  const todayAllSalesData = todayAllSales.map(o => ({ paidAt: o.paidAt, amount: o.totalOrderPrice }));
  const yesterdayAllSalesData = yesterdayAllSales.map(o => ({ paidAt: o.paidAt, amount: o.totalOrderPrice }));

  // PieChart: Start of week sales (Mon-Sun)
  const startOfweekdateSales = await orderModel.find({
    paidAt: { $gte: startOfWeek.toDate() },
    ...dateFilter
  }).select('createdAt totalOrderPrice');

  const startOfweekdateSalesData = startOfweekdateSales.map(o => ({ paidAt: o.paidAt, amount: o.totalOrderPrice }));

  // Response
  res.status(200).json({
    todaySales: { count: todaySales.length, date: today.format() },
    yesterdaySales: { count: yesterdaySales.length, date: yesterday.format() },
    thisMonthSales: { count: thisMonthSales.length, startdate: startOfMonth.format() },
    lastMonthSales: { count: lastMonthSales.length, startdate: startOfLastMonth.format() },
    thisMonthUsers: { count: thisMonthUsers.length, startdate: startOfMonth.format() },
    lastMonthUsers: { count: lastMonthUsers.length, startdate: startOfLastMonth.format() },
    bestSellingProduct,
    todayAllSales: todayAllSalesData,
    yesterdayAllSales: yesterdayAllSalesData,
    startOfweekdateSales: startOfweekdateSalesData
  });
});


export {
  createCashOrder,
  getSpecificOrder,
  getAllOrders,
  createCheckOutSession,
  createOnlineOrder,
  markOrderAsDelivered,
  getDashboardInfo,
};
