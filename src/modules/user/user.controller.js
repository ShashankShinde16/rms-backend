import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factor.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from "../../../Database/models/user.model.js";
import bcrypt from "bcrypt";

const addUser = catchAsyncError(async (req, res, next) => {
  const addUser = new userModel(req.body);
  console.log(req.body);
  await addUser.save();

  res.status(201).json({ message: "success", addUser });
});

const getUserById = catchAsyncError(async (req, res, next) => {
  const id = req.user._id;
  console.log(id);
  const user = await userModel.findById(id).select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    message: "User fetched successfully",
    user,
  });
});

const getAllUsers = catchAsyncError(async (req, res, next) => {
  let apiFeature = new ApiFeatures(userModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();
  const PAGE_NUMBER = apiFeature.queryString.page * 1 || 1;
  const getAllUsers = await apiFeature.mongooseQuery;

  res.status(201).json({ page: PAGE_NUMBER, message: "success", getAllUsers });
});

const updateUser = catchAsyncError(async (req, res, next) => {
  const id = req.user._id;
  const allowedFields = ["name", "addresses"];
  const filteredBody = Object.keys(req.body).reduce((obj, key) => {
    if (allowedFields.includes(key)) obj[key] = req.body[key];
    return obj;
  }, {});
  const updateUser = await userModel.findByIdAndUpdate(id, filteredBody, {
    new: true,
  });

  updateUser && res.status(201).json({ message: "success", updateUser });

  !updateUser && next(new AppError("User was not found", 404));
});

const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const id = req.user._id;
  req.body.passwordChangedAt = Date.now();
  console.log(req.body.passwordChangedAt);
  const changeUserPassword = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  changeUserPassword &&
    res.status(201).json({ message: "success", changeUserPassword });

  !changeUserPassword && next(new AppError("User was not found", 404));
});
const deleteUser = deleteOne(userModel, "user");

export { addUser, getAllUsers, updateUser, deleteUser, changeUserPassword, getUserById };
