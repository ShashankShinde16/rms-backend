import express from "express";
import * as User from "./user.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  addUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
  updateUserValidation,
} from "./user.validation.js";
import { protectedRoutes } from "../auth/auth.controller.js";

const userRouter = express.Router();

userRouter
  .route("/")
  .post(validate(addUserValidation), User.addUser)
  .get(User.getAllUsers);

userRouter
  .route("/me")
  .get(protectedRoutes,User.getUserById)
  .put(protectedRoutes,validate(updateUserValidation), User.updateUser)
  .delete(validate(deleteUserValidation), User.deleteUser)
  .patch(
    // validate(changeUserPasswordValidation), 
    User.changeUserPassword);

export default userRouter;
