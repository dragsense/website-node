const mongoose = require('mongoose');

const { toJSON, paginate } = require('../plugins')



const CartSchema = mongoose.Schema(
  {
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    Products: [
      {
        ProductId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        Quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    TotalItems: {
      type: Number,
      default: 0,
    },
    TotalAmount: {
      type: Number,
      default: 0,
    },
    TotalTax: {
        type: Number,
        default: 0,
      },
  },
  { timestamps: true }
);


CartSchema.plugin(toJSON)
CartSchema.plugin(paginate)


const Cart = mongoose.model('AC_WO_Cart', CartSchema);

module.exports = Cart;