const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

const Variation = mongoose.model('AC_WO_Variation', variationSchema);


module.exports = Variation;
 