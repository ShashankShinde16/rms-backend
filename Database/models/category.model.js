import { Schema, model } from "mongoose";

const categorySchema = new Schema(
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
    slug: {
      type: String,
      lowercase: true,
    },
    Image: {
      type: String,
    },
  },
  { timestamps: true }
);
// categorySchema.post("init", function (doc) {
//   doc.Image = `${process.env.BASE_URL}category/${doc.Image}`;
//   // console.log(doc);
// });
export const categoryModel = model("category", categorySchema);
