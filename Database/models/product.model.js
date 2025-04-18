import { Schema, model } from "mongoose";

const sizeOptionSchema = new Schema({
  size: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

const variationSchema = new Schema({
  color: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  sizes: [sizeOptionSchema],
});

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    subcategory_id: {
      type: Schema.Types.ObjectId,
      ref: "subcategory",
      required: true,
    },
    brand_id: {
      type: Schema.Types.ObjectId,
      ref: "brand",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Unisex"],
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    variations: [variationSchema],
    tags: [
      {
        name: {
          type: String,
          required: true,
        },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.virtual("reviews", {
  ref: "review",
  localField: "_id",
  foreignField: "productId",
});

productSchema.pre(["find", "findOne"], function () {
  this.populate("reviews");
});

export const productModel = model("product", productSchema);

// const productSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       minLength: [3, "Too Short product Name"],
//     },
//     imgCover: {
//       type: String,
//     },
//     images: {
//       type: [String],
//     },
//     descripton: {
//       type: String,
//       maxlength: [100, "Description should be less than or equal to 100"],
//       minlength: [10, "Description should be more than or equal to 10"],
//       required: true,
//       trim: true,
//     },
//     category: {
//       type: Schema.ObjectId,
//       ref: "category",
//       required: true,
//     },
//     subcategory: {
//       type: Schema.ObjectId,
//       ref: "subcategory",
//       required: true,
//     },
//     brand: {
//       type: Schema.ObjectId,
//       ref: "brand",
//       required: true,
//     },
//     variations: [
//       {
//         color: {
//           type: Number,
//           default: 0,
//           min: 0,
//           required: true,
//         },
//         size: {
//           type: String,
//           enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
//           trim: true,
//         },
//         price: {
//           type: Number,
//           default: 0,
//           min: 0,
//           required: true,
//         },
//         priceAfterDiscount: {
//           type: Number,
//           default: 0,
//           min: 0,
//         },
//         quantity: {
//           type: Number,
//           default: 0,
//           min: 0,
//         },
//       },
//     ],
//     ratingAvg: {
//       type: Number,
//       min: 1,
//       max: 5,
//     },
//     ratingCount: {
//       type: Number,
//       min: 0,
//     },
//   },
//   { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
// );

// const mongoose = require("mongoose");
