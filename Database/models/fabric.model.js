import { Schema, model } from "mongoose";

const fabricSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [1, "Fabric name is too short"],
    },
  },
  { timestamps: true }
);

export const fabricModel = model("fabric", fabricSchema);
