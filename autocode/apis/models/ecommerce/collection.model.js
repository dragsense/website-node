const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
});

const Collection = mongoose.model('AC_WO_ProductCollection', CollectionSchema);


module.exports = Collection;