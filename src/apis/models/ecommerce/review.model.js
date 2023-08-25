const mongoose = require("mongoose");

const { toJSON, paginate } = require('../plugins')


const ReviewSchema = mongoose.Schema(
  {
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    Title: {
      type: String,
      trim: true,
    },
    Rating: {
      type: Number,
      default: 0,
    },
    Review: {
      type: String,
      trim: true,
    },
    IsRecommended: {
      type: Boolean,
      default: true,
    },
    Status: {
      type: String,
      default: "Waiting Approval",
      enum: ["Waiting Approval", "Rejected", "Approved"],
    },
  },
  { timestamps: true }
);


ReviewSchema.plugin(toJSON)
ReviewSchema.plugin(paginate)

const Review = mongoose.model('AC_WO_Review', ReviewSchema);


module.exports = Review;