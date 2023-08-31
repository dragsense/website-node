const mongoose = require('mongoose');

const { toJSON, paginate } = require('../plugins')


const BrandSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
    },
    LogoUrl: {
      type: String,
    },
    IsActive: {
      type: Boolean,
      default: true,
    },
    MerchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
    },
  },
  { timestamps: true }
);


BrandSchema.plugin(toJSON)
BrandSchema.plugin(paginate)

const Brand = mongoose.model('AC_WO_Brand', BrandSchema);

module.exports = Brand;