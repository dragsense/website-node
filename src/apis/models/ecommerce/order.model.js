const mongoose = require('mongoose');


const { toJSON, paginate } = require('../plugins')


const OrderSchema = mongoose.Schema(
    {
        UserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        CartId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Cart',
        },
        ShippingAddressId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ShippingAddress',
        },
        PaymentMethod: {
          type: String,
          required: true,
        },
        Status: {
          type: String,
          enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
          default: 'Pending',
        },
      },
    { timestamps: true }
);


OrderSchema.plugin(toJSON)
OrderSchema.plugin(paginate)

const Order = mongoose.model('AC_WO_Order', OrderSchema);

module.exports = Order;