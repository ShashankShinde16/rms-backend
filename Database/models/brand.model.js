import { Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
    },
  },
  { timestamps: true }
);

export const brandModel = model("brand", brandSchema);
