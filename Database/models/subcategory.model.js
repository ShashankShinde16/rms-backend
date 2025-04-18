import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [1, "Too Short"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Too Short"],
    },
    category: {
      type: Schema.ObjectId,
      required: true,
      ref: "category",
    },
  },
  { timestamps: true }
);

export const subCategoryModel = model("subcategory", subCategorySchema);
