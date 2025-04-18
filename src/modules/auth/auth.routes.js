import express from "express";
import * as auth from "./auth.controller.js";

const authRouter = express.Router();

authRouter.post("/send-otp", auth.sendOtp);
authRouter.post("/verify-otp", auth.verifyOtp);
authRouter.post("/signup", auth.signUp);
authRouter.post("/signin", auth.signIn);

export default authRouter;
