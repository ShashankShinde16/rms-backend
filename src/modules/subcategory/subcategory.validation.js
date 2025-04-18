import Joi from "joi";

const addSubCategoryValidation = Joi.object({
  name: Joi.string().required().min(2).trim(),
  description: Joi.string().required().min(2).trim(),
});

const updateSubCategoryValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  name: Joi.string().required().min(2).trim(),
  description: Joi.string().required().min(2).trim(),
});

const deleteSubCategoryValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export {
  addSubCategoryValidation,
  updateSubCategoryValidation,
  deleteSubCategoryValidation,
};
