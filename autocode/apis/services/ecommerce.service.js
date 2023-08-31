const { 
    Product,
    Order,
    Category,
    Cart, 
    ShippingAddress,
    Merchant,
    Brand,
    Review,
    Wishlist,
    Collection,
    Variation,
} = require('../models/ecommerce');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')


/**
 * Create a product
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const createProduct = async (productBody) => {

    const { name } = productBody;

    const product = await Product.findOne({ name })
    if (!product) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Product.create(productBody);
};

/**
 * Update a product
 * @param {String} id
 * @param {Object} productBody
 * @returns {Promise<Product>}
 */
const updateProduct = async (id, productBody) => {

    const product = await Product.findOne({ _id: id })
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    Object.assign(product, productBody);
    await product.save();
    return product;
};

/**
 * Get Products
 * @returns {Promise<Products>}
 */
const getProducts = async () => {
    return Product.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a product
 * @param {String} id
 * @returns {Promise<Product>}
 */
const getProduct = async (id) => {
    const product = await Product.findOne({ _id: id })
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    return product;
};


/**
 * Delete a product
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteProduct = async (id) => {
    const product = await Product.deleteOne({ _id: id })
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }
    return id;
};



/**
 * Create a category
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {

    const { name } = categoryBody;

    const category = await Category.findOne({ name })
    if (!category) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Category.create(categoryBody);
};

/**
 * Update a category
 * @param {String} id
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const updateCategory = async (id, categoryBody) => {

    const category = await Category.findOne({ _id: id })
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    Object.assign(category, categoryBody);
    await category.save();
    return category;
};

/**
 * Get Categorys
 * @returns {Promise<Categorys>}
 */
const getCategories = async () => {
    return Category.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a category
 * @param {String} id
 * @returns {Promise<Category>}
 */
const getCategory = async (id) => {
    const category = await Category.findOne({ _id: id })
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    return category;
};


/**
 * Delete a category
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteCategory = async (id) => {
    const category = await Category.deleteOne({ _id: id })
    if (!category) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    }
    return id;
};



/**
 * Create a order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {

    const { name } = orderBody;

    const order = await Order.findOne({ name })
    if (!order) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Order.create(orderBody);
};

/**
 * Update a order
 * @param {String} id
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const updateOrder = async (id, orderBody) => {

    const order = await Order.findOne({ _id: id })
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    Object.assign(order, orderBody);
    await order.save();
    return order;
};

/**
 * Get Orders
 * @returns {Promise<Orders>}
 */
const getOrders = async () => {
    return Order.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a order
 * @param {String} id
 * @returns {Promise<Order>}
 */
const getOrder = async (id) => {
    const order = await Order.findOne({ _id: id })
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    return order;
};


/**
 * Delete a order
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteOrder = async (id) => {
    const order = await Order.deleteOne({ _id: id })
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    return id;
};



/**
 * Create a cart
 * @param {Object} cartBody
 * @returns {Promise<Cart>}
 */
const createCart = async (cartBody) => {

    const { name } = cartBody;

    const cart = await Cart.findOne({ name })
    if (!cart) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Cart.create(cartBody);
};

/**
 * Update a cart
 * @param {String} id
 * @param {Object} cartBody
 * @returns {Promise<Cart>}
 */
const updateCart = async (id, cartBody) => {

    const cart = await Cart.findOne({ _id: id })
    if (!cart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }
    Object.assign(cart, cartBody);
    await cart.save();
    return cart;
};

/**
 * Get Carts
 * @returns {Promise<Carts>}
 */
const getCarts = async () => {
    return Cart.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a cart
 * @param {String} id
 * @returns {Promise<Cart>}
 */
const getCart = async (id) => {
    const cart = await Cart.findOne({ _id: id })
    if (!cart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }
    return cart;
};


/**
 * Delete a cart
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteCart = async (id) => {
    const cart = await Cart.deleteOne({ _id: id })
    if (!cart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }
    return id;
};


/**
 * Create a shippingAddress
 * @param {Object} shippingAddressBody
 * @returns {Promise<ShippingAddress>}
 */
const createShippingAddress = async (shippingAddressBody) => {

    const { name } = shippingAddressBody;

    const shippingAddress = await ShippingAddress.findOne({ name })
    if (!shippingAddress) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return ShippingAddress.create(shippingAddressBody);
};

/**
 * Update a shippingAddress
 * @param {String} id
 * @param {Object} shippingAddressBody
 * @returns {Promise<ShippingAddress>}
 */
const updateShippingAddress = async (id, shippingAddressBody) => {

    const shippingAddress = await ShippingAddress.findOne({ _id: id })
    if (!shippingAddress) {
        throw new ApiError(httpStatus.NOT_FOUND, 'ShippingAddress not found');
    }
    Object.assign(shippingAddress, shippingAddressBody);
    await shippingAddress.save();
    return shippingAddress;
};

/**
 * Get ShippingAddresss
 * @returns {Promise<ShippingAddresss>}
 */
const getShippingAddresses = async () => {
    return ShippingAddress.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a shippingAddress
 * @param {String} id
 * @returns {Promise<ShippingAddress>}
 */
const getShippingAddress = async (id) => {
    const shippingAddress = await ShippingAddress.findOne({ _id: id })
    if (!shippingAddress) {
        throw new ApiError(httpStatus.NOT_FOUND, 'ShippingAddress not found');
    }
    return shippingAddress;
};


/**
 * Delete a shippingAddress
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteShippingAddress = async (id) => {
    const shippingAddress = await ShippingAddress.deleteOne({ _id: id })
    if (!shippingAddress) {
        throw new ApiError(httpStatus.NOT_FOUND, 'ShippingAddress not found');
    }
    return id;
};


/**
 * Create a brand
 * @param {Object} brandBody
 * @returns {Promise<Brand>}
 */
const createBrand = async (brandBody) => {

    const { name } = brandBody;

    const brand = await Brand.findOne({ name })
    if (!brand) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Brand.create(brandBody);
};

/**
 * Update a brand
 * @param {String} id
 * @param {Object} brandBody
 * @returns {Promise<Brand>}
 */
const updateBrand = async (id, brandBody) => {

    const brand = await Brand.findOne({ _id: id })
    if (!brand) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
    }
    Object.assign(brand, brandBody);
    await brand.save();
    return brand;
};

/**
 * Get Brands
 * @returns {Promise<Brands>}
 */
const getBrands = async () => {
    return Brand.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a brand
 * @param {String} id
 * @returns {Promise<Brand>}
 */
const getBrand = async (id) => {
    const brand = await Brand.findOne({ _id: id })
    if (!brand) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
    }
    return brand;
};


/**
 * Delete a brand
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteBrand = async (id) => {
    const brand = await Brand.deleteOne({ _id: id })
    if (!brand) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
    }
    return id;
};


/**
 * Create a merchant
 * @param {Object} merchantBody
 * @returns {Promise<Merchant>}
 */
const createMerchant = async (merchantBody) => {

    const { name } = merchantBody;

    const merchant = await Merchant.findOne({ name })
    if (!merchant) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Merchant.create(merchantBody);
};

/**
 * Update a merchant
 * @param {String} id
 * @param {Object} merchantBody
 * @returns {Promise<Merchant>}
 */
const updateMerchant = async (id, merchantBody) => {

    const merchant = await Merchant.findOne({ _id: id })
    if (!merchant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
    }
    Object.assign(merchant, merchantBody);
    await merchant.save();
    return merchant;
};

/**
 * Get Merchants
 * @returns {Promise<Merchants>}
 */
const getMerchants = async () => {
    return Merchant.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a merchant
 * @param {String} id
 * @returns {Promise<Merchant>}
 */
const getMerchant = async (id) => {
    const merchant = await Merchant.findOne({ _id: id })
    if (!merchant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
    }
    return merchant;
};


/**
 * Delete a merchant
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteMerchant = async (id) => {
    const merchant = await Merchant.deleteOne({ _id: id })
    if (!merchant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Merchant not found');
    }
    return id;
};

/**
 * Create a review
 * @param {Object} reviewBody
 * @returns {Promise<Review>}
 */
const createReview = async (reviewBody) => {

    const { name } = reviewBody;

    const review = await Review.findOne({ name })
    if (!review) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Review.create(reviewBody);
};

/**
 * Update a review
 * @param {String} id
 * @param {Object} reviewBody
 * @returns {Promise<Review>}
 */
const updateReview = async (id, reviewBody) => {

    const review = await Review.findOne({ _id: id })
    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    Object.assign(review, reviewBody);
    await review.save();
    return review;
};

/**
 * Get Reviews
 * @returns {Promise<Reviews>}
 */
const getReviews = async () => {
    return Review.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a review
 * @param {String} id
 * @returns {Promise<Review>}
 */
const getReview = async (id) => {
    const review = await Review.findOne({ _id: id })
    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    return review;
};


/**
 * Delete a review
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteReview = async (id) => {
    const review = await Review.deleteOne({ _id: id })
    if (!review) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
    }
    return id;
};

/**
 * Create a wishlist
 * @param {Object} wishlistBody
 * @returns {Promise<Wishlist>}
 */
const createWishlist = async (wishlistBody) => {

    const { name } = wishlistBody;

    const wishlist = await Wishlist.findOne({ name })
    if (!wishlist) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Wishlist.create(wishlistBody);
};

/**
 * Update a wishlist
 * @param {String} id
 * @param {Object} wishlistBody
 * @returns {Promise<Wishlist>}
 */
const updateWishlist = async (id, wishlistBody) => {

    const wishlist = await Wishlist.findOne({ _id: id })
    if (!wishlist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Wishlist not found');
    }
    Object.assign(wishlist, wishlistBody);
    await wishlist.save();
    return wishlist;
};

/**
 * Get Wishlists
 * @returns {Promise<Wishlists>}
 */
const getWishlists = async () => {
    return Wishlist.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a wishlist
 * @param {String} id
 * @returns {Promise<Wishlist>}
 */
const getWishlist = async (id) => {
    const wishlist = await Wishlist.findOne({ _id: id })
    if (!wishlist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Wishlist not found');
    }
    return wishlist;
};


/**
 * Delete a wishlist
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteWishlist = async (id) => {
    const wishlist = await Wishlist.deleteOne({ _id: id })
    if (!wishlist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Wishlist not found');
    }
    return id;
};


/**
 * Create a variation
 * @param {Object} variationBody
 * @returns {Promise<Variation>}
 */
const createVariation = async (variationBody) => {

    const { name } = variationBody;

    const variation = await Variation.findOne({ name })
    if (!variation) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Variation.create(variationBody);
};

/**
 * Update a variation
 * @param {String} id
 * @param {Object} variationBody
 * @returns {Promise<Variation>}
 */
const updateVariation = async (id, variationBody) => {

    const variation = await Variation.findOne({ _id: id })
    if (!variation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Variation not found');
    }
    Object.assign(variation, variationBody);
    await variation.save();
    return variation;
};

/**
 * Get Variations
 * @returns {Promise<Variations>}
 */
const getVariations = async () => {
    return Variation.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a variation
 * @param {String} id
 * @returns {Promise<Variation>}
 */
const getVariation = async (id) => {
    const variation = await Variation.findOne({ _id: id })
    if (!variation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Variation not found');
    }
    return variation;
};


/**
 * Delete a variation
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteVariation = async (id) => {
    const variation = await Variation.deleteOne({ _id: id })
    if (!variation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Variation not found');
    }
    return id;
};


/**
 * Create a collection
 * @param {Object} collectionBody
 * @returns {Promise<Collection>}
 */
const createCollection = async (collectionBody) => {

    const { name } = collectionBody;

    const collection = await Collection.findOne({ name })
    if (!collection) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
    }
    return Collection.create(collectionBody);
};

/**
 * Update a collection
 * @param {String} id
 * @param {Object} collectionBody
 * @returns {Promise<Collection>}
 */
const updateCollection = async (id, collectionBody) => {

    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }
    Object.assign(collection, collectionBody);
    await collection.save();
    return collection;
};

/**
 * Get Collections
 * @returns {Promise<Collections>}
 */
const getCollections = async () => {
    return Collection.find({}).sort({ _id: -1 }).lean()

};

/**
 * Delete a collection
 * @param {String} id
 * @returns {Promise<Collection>}
 */
const getCollection = async (id) => {
    const collection = await Collection.findOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }
    return collection;
};


/**
 * Delete a collection
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteCollection = async (id) => {
    const collection = await Collection.deleteOne({ _id: id })
    if (!collection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Collection not found');
    }
    return id;
};



module.exports = {
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    createProduct,
    getCollections,
    getCollection,
    deleteCollection,
    updateCollection,
    createCollection,
    getVariations,
    getVariation,
    deleteVariation,
    updateVariation,
    createVariation,
    getCategories,
    getCategory,
    deleteCategory,
    updateCategory,
    createCategory,
    getOrders,
    getOrder,
    deleteOrder,
    updateOrder,
    createOrder,
    getCarts,
    getCart,
    deleteCart,
    updateCart,
    createCart,
    getShippingAddresses,
    getShippingAddress,
    deleteShippingAddress,
    updateShippingAddress,
    createShippingAddress,
    getBrands,
    getBrand,
    deleteBrand,
    updateBrand,
    createBrand,
    getMerchants,
    getMerchant,
    deleteMerchant,
    updateMerchant,
    createMerchant,
    getReviews,
    getReview,
    deleteReview,
    updateReview,
    createReview,
    getWishlists,
    getWishlist,
    deleteWishlist,
    updateWishlist,
    createWishlist,
    getWishlists,
    getWishlist,
    deleteWishlist,
    updateWishlist,
    createWishlist,
};