const mongoose = require('mongoose');

const { toJSON, paginate } = require('../plugins')



const WishlistSchema = mongoose.Schema(
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
        AddedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    IsLiked: {
        type: Boolean,
        default: false,
      },
  },
  
  { timestamps: true }
);


WishlistSchema.plugin(toJSON)
WishlistSchema.plugin(paginate)

const Wishlist = mongoose.model('AC_WO_Wishlist', WishlistSchema);

module.exports = Wishlist;