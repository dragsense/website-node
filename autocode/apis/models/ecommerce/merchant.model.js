const mongoose = require('mongoose');

const { toJSON, paginate } = require('../plugins')



const MerchantSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
    },
    Email: {
      type: String,
      required: true,
    },
    Phone: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
    },
    City: {
      type: String,
    },
    State: {
      type: String,
    },
    Country: {
      type: String,
    },
    IsActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


MerchantSchema.plugin(toJSON)
MerchantSchema.plugin(paginate)

const Merchant = mongoose.model('AC_WO_Merchant', MerchantSchema);

module.exports = Merchant;