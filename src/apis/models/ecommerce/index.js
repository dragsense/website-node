
const mongoose = require('mongoose');

const slug = require('mongoose-slug-generator');


const options = {
    separator: "-",
    lang: "en",
    truncate: 120,
};

mongoose.plugin(slug, options);

module.exports.Product = require('./product.model');
module.exports.Category = require('./category.model')
module.exports.Order = require('./order.model');
module.exports.Cart = require('./cart.model');
module.exports.ShippingAddress = require('./shipping.model');
module.exports.Merchant = require('./merchant.model');
module.exports.Brand = require('./brand.model');
module.exports.Review = require('./review.model');
module.exports.Wishlist = require('./wishlist.model');
module.exports.Variation = require('./variation.model');
module.exports.Collection = require('./collection.model');
