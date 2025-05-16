import Joi from "joi";

const addUserValidation = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().required().trim(),
  password: Joi.string().required(),
});

const updateUserValidation = Joi.object({
  name: Joi.string().trim(),
  password: Joi.string(),
  email: Joi.string().email(),
  role: Joi.string().valid("user", "admin"), // or whatever roles you support
  isActive: Joi.boolean(),
  verified: Joi.boolean(),
  blocked: Joi.boolean(),
  wishlist: Joi.array().items(Joi.any()),
  addresses: Joi.array().items(Joi.any()),
  coupon: Joi.array().items(Joi.string().hex().length(24)).optional(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
  __v: Joi.number(),
  _id: Joi.string().hex().length(24), // optional or required if needed
});


const changeUserPasswordValidation = Joi.object({
  password: Joi.string().required(),
  id: Joi.string().hex().length(24).required(),
});

const deleteUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export {
  addUserValidation,
  updateUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
};
