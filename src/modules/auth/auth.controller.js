import { userModel } from "../../../Database/models/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { otpModel } from "../../../Database/models/otp.model.js";
import dotenv from "dotenv";
dotenv.config();
import twilio from "twilio";
import { resend } from "../../utils/resendClient.js";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendOtp = catchAsyncError(async (req, res, next) => {
  const { email, phone, purpose } = req.body;

  const user = await userModel.findOne({ email });

  if (purpose === "signup") {
    if (!phone)
      return next(new AppError("Phone number is required", 400));
    if (user) {
      return next(new AppError("Account already exists!", 409));
    }
  }

  if (purpose === "verify-phone") {
    if (!phone)
      return next(new AppError("Phone number is required", 400));
  }

  if (purpose === "reset") {
    if (!user) {
      return next(new AppError("No account found with this email!", 404));
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any previous OTPs for this email
  await otpModel.deleteMany({ email });

  await otpModel.create({ email, otp, expiresAt });

  if (purpose != "verify-phone") {
    await resend.emails.send({
      from: "auth@rmsjeans.com",
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    });
  }

  await client.messages.create({
    body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phone}`, // Or any phone number you want to send to
  });

  res.status(200).json({ message: "OTP sent successfully" });
});


const verifyOtp = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  const otpRecord = await otpModel.findOne({ email });

  if (!otpRecord) return next(new AppError("OTP not found or expired", 400));
  if (otpRecord.otp !== otp) return next(new AppError("Invalid OTP", 400));
  if (Date.now() > otpRecord.expiresAt) {
    await otpModel.deleteOne({ email }); // clean up
    return next(new AppError("OTP expired", 400));
  }

  await otpModel.deleteOne({ email }); // delete after successful verification

  res.status(200).json({ message: "OTP verified successfully" });
});



const signUp = catchAsyncError(async (req, res, next) => {
  // console.log(req.body.email);
  let isUserExist = await userModel.findOne({ email: req.body.email });
  if (isUserExist) {
    return next(new AppError("Account is already exist!", 409));
  }
  const user = new userModel(req.body);
  console.log(user);
  await user.save();

  let token = jwt.sign(
    { email: user.email, name: user.name, id: user._id, role: user.role },
    "JR"
  );

  res.status(201).json({ message: "success", user, token });
});

const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return next(new AppError("Invalid email or password", 401));
  }
  let token = jwt.sign(
    { email: user.email, name: user.name, id: user._id, role: user.role },
    "JR"
  );
  res.status(201).json({
    message: "success",
    token,
    user: { role: user.role, name: user.name, userID: user._id },
  });
});

const protectedRoutes = catchAsyncError(async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return next(new AppError("Token was not provided!", 401));

  let decoded = await jwt.verify(token, "JR");

  // console.log(decoded);
  // console.log(decoded.iat);

  let user = await userModel.findById(decoded.id);
  if (!user) return next(new AppError("Invalid user", 404));
  // console.log(user);
  // console.log(user.passwordChangedAt);

  if (user.passwordChangedAt) {
    let passwordChangedAt = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (passwordChangedAt > decoded.iat)
      return next(new AppError("Invalid token", 401));
  }
  // console.log(decoded.iat, "-------------->",passwordChangedAt);

  req.user = user;

  next();
});

const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          `You are not authorized to access this route. Your are ${req.user.role}`,
          401
        )
      );
    next();
  });
};
export { sendOtp, verifyOtp, signUp, signIn, protectedRoutes, allowedTo };
