const mongoose = require('mongoose');

const { toJSON, paginate } = require('../plugins')


const CategorySchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Slug: {
        type: String,
        slug: "title",
        required: true,
      },
    Description: {
      type: String,
    },
    ImageUrl: {
      type: String,
    },
    ImageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: null,
      },
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
 
    IsActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


CategorySchema.plugin(toJSON)
CategorySchema.plugin(paginate)


const Category = mongoose.model('AC_WO_Category', CategorySchema);

module.exports = Category;