import express from "express";
// import { validate } from "../../middlewares/validate.js";

import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import * as order from "../order/order.controller.js"
const orderRouter = express.Router();



orderRouter
  .route('/:id([0-9a-fA-F]{24})')
  .post(
    protectedRoutes,
    allowedTo("user"),
    order.createCashOrder
  )
  orderRouter
  .route("/")
  .get(
    protectedRoutes,
    allowedTo("user"),
    order.getSpecificOrder
  )

  orderRouter.post('/checkOut/:id' ,protectedRoutes, allowedTo("user"),order.createCheckOutSession)

  orderRouter.post('/verify', protectedRoutes, allowedTo("user"), order.createOnlineOrder)

  orderRouter.get('/all',order.getAllOrders)

  orderRouter.patch(
    "/:id/deliver",
    protectedRoutes,
    allowedTo("Admin"),
    order.markOrderAsDelivered
  );

  orderRouter.patch(
    "/:id/cancel",
    protectedRoutes,
    allowedTo("Admin"), // both roles can cancel
    order.cancelOrder
  );
  
  //dashboard
  orderRouter.get(
    "/dashboard",
    protectedRoutes,
    allowedTo("Admin"),
    order.getDashboardInfo
  );
  
export default orderRouter;
