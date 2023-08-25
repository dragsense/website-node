const mongoose = require('mongoose')

const { toJSON, paginate } = require('../plugins')


const ProductSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      trim: true,
      unique: true,
      validate: {
        validator: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
        message: 'Invalid Name format',
      },
    },
    Title: {
      type: String,
      trim: true,
      unique: false,
    },
    slug: {
      type: String,
      slug: 'Title',
      unique: true,
    },
    Description: {
      type: String,
      trim: true,
    },
    Price: {
      type: Number,
      default: 1,
      validate: {
        validator: (value) => value >= 0,
        message: 'Price must be a non-negative number',
      },
    },
    ImageUrl: {
      type: String,
    },
    variations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variation',
    }],
    IsActive: {
      type: Boolean,
      default: true,
    },
    Taxable: {
      type: Boolean,
      default: false,
    },
    ImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    BrandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    CategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    MerchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    updater: {
      type: Object,
      default: {},
    },
    creator: {
      type: Object,
      default: {},
    },

  },
  { timestamps: true }
);

ProductSchema.plugin(toJSON)
ProductSchema.plugin(paginate)

/**
 * @typedef Product
 */
const Product = mongoose.model("AC_WO_Product", ProductSchema);

module.exports = Product
