const mongoose = require('mongoose');

const { toJSON, paginate } = require('../plugins')



const ShippingSchema = mongoose.Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    AddressLine1: {
      type: String,
      required: true,
    },
    AddressLine2: {
      type: String,
    },
    City: {
      type: String,
      required: true,
    },
    State: {
      type: String,
      required: true,
    },
    PostalCode: {
      type: String,
      required: true,
    },
    Country: {
      type: String,
      required: true,
    },
    IsDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


ShippingSchema.plugin(toJSON)
ShippingSchema.plugin(paginate)

const ShippingAddress = mongoose.model('AC_WO_ShippingAddress', ShippingSchema);

module.exports = ShippingAddress;