import express from "express";
import { dbConnection } from "./Database/dbConnection.js";
import { bootstrap } from "./src/bootstrap.js";
import dotenv from "dotenv";
import cors from "cors";
import { createOnlineOrder } from "./src/modules/order/order.controller.js";

dotenv.config();
const app = express();
// app.use(cors({ credentials: true, origin: ["http://localhost:5173"] }));
app.use(cors({ origin: true, credentials: true }));

const port = 3000;
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  createOnlineOrder
);
app.use(express.json());
// app.use(morgan("dev"));
app.use(express.static("uploads"));

bootstrap(app);
dbConnection();
app.listen(process.env.PORT || port, () =>
  console.log(`Example app listening on port ${port}!`)
);
