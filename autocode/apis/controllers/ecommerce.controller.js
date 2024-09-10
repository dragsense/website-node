const httpStatus = require('http-status');
const catchAsync = require('../../utils/catch-async');
const ApiError = require('../../utils/api-error'); // Ensure this is correctly imported
const { loadService } = require('../../loaders/servicesLoader')


// Product CRUD
const CreateProduct = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createProduct not found');
    }
    const product = await ecommerceService.createProduct(req.body);
    res.status(httpStatus.CREATED).send({ product });
});

const UpdateProduct = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateProduct not found');
    }
    const product = await ecommerceService.updateProduct(req.params.id, req.body);
    res.status(httpStatus.OK).send({ product });
});

const DeleteProduct = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteProduct not found');
    }
    await ecommerceService.deleteProduct(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetProduct = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getProduct) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getProduct not found');
    }
    const product = await ecommerceService.getProduct(req.params.id);
    res.status(httpStatus.OK).send({ product });
});

const GetProducts = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getProducts) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getProducts not found');
    }
    const products = await ecommerceService.getProducts();
    res.status(httpStatus.OK).send({ products });
});

// Variation CRUD
const CreateVariation = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createVariation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createVariation not found');
    }
    const variation = await ecommerceService.createVariation(req.body);
    res.status(httpStatus.CREATED).send({ variation });
});

const UpdateVariation = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateVariation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateVariation not found');
    }
    const variation = await ecommerceService.updateVariation(req.params.id, req.body);
    res.status(httpStatus.OK).send({ variation });
});

const DeleteVariation = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteVariation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteVariation not found');
    }
    await ecommerceService.deleteVariation(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetVariation = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getVariation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getVariation not found');
    }
    const variation = await ecommerceService.getVariation(req.params.id);
    res.status(httpStatus.OK).send({ variation });
});

const GetVariations = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getVariations) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getVariations not found');
    }
    const variations = await ecommerceService.getVariations();
    res.status(httpStatus.OK).send({ variations });
});

// Collection CRUD
const CreateCollection = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createCollection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createCollection not found');
    }
    const collection = await ecommerceService.createCollection(req.body);
    res.status(httpStatus.CREATED).send({ collection });
});

const UpdateCollection = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateCollection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateCollection not found');
    }
    const collection = await ecommerceService.updateCollection(req.params.id, req.body);
    res.status(httpStatus.OK).send({ collection });
});

const DeleteCollection = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteCollection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteCollection not found');
    }
    await ecommerceService.deleteCollection(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetCollection = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getCollection) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getCollection not found');
    }
    const collection = await ecommerceService.getCollection(req.params.id);
    res.status(httpStatus.OK).send({ collection });
});

const GetCollections = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getCollections) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getCollections not found');
    }
    const collections = await ecommerceService.getCollections();
    res.status(httpStatus.OK).send({ collections });
});

// Cart CRUD
const CreateCart = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createCart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createCart not found');
    }
    const cartItem = await ecommerceService.createCart(req.body);
    res.status(httpStatus.CREATED).send({ cartItem });
});

const UpdateCart = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateCart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateCart not found');
    }
    const cartItem = await ecommerceService.updateCart(req.params.id, req.body);
    res.status(httpStatus.OK).send({ cartItem });
});

const GetCart = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getCart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getCart not found');
    }
    const cartItem = await ecommerceService.getCart(req.params.id);
    res.status(httpStatus.OK).send({ cartItem });
});

const DeleteCart = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteCart) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteCart not found');
    }
    await ecommerceService.deleteCart(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetCarts = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getCarts) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getCarts not found');
    }
    const cartItems = await ecommerceService.getCarts();
    res.status(httpStatus.OK).send({ cartItems });
});

// Category CRUD
const CreateCategory = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createCategory not found');
    }
    const category = await ecommerceService.createCategory(req.body);
    res.status(httpStatus.CREATED).send({ category });
});

const UpdateCategory = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateCategory not found');
    }
    const category = await ecommerceService.updateCategory(req.params.id, req.body);
    res.status(httpStatus.OK).send({ category });
});

const DeleteCategory = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteCategory not found');
    }
    await ecommerceService.deleteCategory(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetCategory = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getCategory not found');
    }
    const category = await ecommerceService.getCategory(req.params.id);
    res.status(httpStatus.OK).send({ category });
});

const GetCategories = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getCategories) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getCategories not found');
    }
    const categories = await ecommerceService.getCategories();
    res.status(httpStatus.OK).send({ categories });
});

// Order CRUD
const CreateOrder = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createOrder not found');
    }
    const order = await ecommerceService.createOrder(req.body);
    res.status(httpStatus.CREATED).send({ order });
});

const UpdateOrder = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateOrder not found');
    }
    const order = await ecommerceService.updateOrder(req.params.id, req.body);
    res.status(httpStatus.OK).send({ order });
});

const GetOrder = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getOrder not found');
    }
    const order = await ecommerceService.getOrder(req.params.id);
    res.status(httpStatus.OK).send({ order });
});

const GetOrders = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getOrders) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getOrders not found');
    }
    const orders = await ecommerceService.getOrders();
    res.status(httpStatus.OK).send({ orders });
});

const DeleteOrder = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteOrder not found');
    }
    await ecommerceService.deleteOrder(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

// Merchant CRUD
const CreateMerchant = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createMerchant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createMerchant not found');
    }
    const merchant = await ecommerceService.createMerchant(req.body);
    res.status(httpStatus.CREATED).send({ merchant });
});

const UpdateMerchant = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateMerchant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateMerchant not found');
    }
    const merchant = await ecommerceService.updateMerchant(req.params.id, req.body);
    res.status(httpStatus.OK).send({ merchant });
});

const GetMerchant = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getMerchant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getMerchant not found');
    }
    const merchant = await ecommerceService.getMerchant(req.params.id);
    res.status(httpStatus.OK).send({ merchant });
});

const GetMerchants = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getMerchants) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getMerchants not found');
    }
    const merchants = await ecommerceService.getMerchants();
    res.status(httpStatus.OK).send({ merchants });
});

const DeleteMerchant = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteMerchant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteMerchant not found');
    }
    await ecommerceService.deleteMerchant(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

// Brand CRUD
const CreateBrand = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createBrand) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createBrand not found');
    }
    const brand = await ecommerceService.createBrand(req.body);
    res.status(httpStatus.CREATED).send({ brand });
});

const UpdateBrand = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateBrand) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateBrand not found');
    }
    const brand = await ecommerceService.updateBrand(req.params.id, req.body);
    res.status(httpStatus.OK).send({ brand });
});

const GetBrand = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getBrand) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getBrand not found');
    }
    const brand = await ecommerceService.getBrand(req.params.id);
    res.status(httpStatus.OK).send({ brand });
});

const GetBrands = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getBrands) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getBrands not found');
    }
    const brands = await ecommerceService.getBrands();
    res.status(httpStatus.OK).send({ brands });
});

const DeleteBrand = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteBrand) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteBrand not found');
    }
    await ecommerceService.deleteBrand(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

// Review CRUD
const CreateReview = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createReview) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createReview not found');
    }
    const review = await ecommerceService.createReview(req.body);
    res.status(httpStatus.CREATED).send({ review });
});

const UpdateReview = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateReview) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateReview not found');
    }
    const review = await ecommerceService.updateReview(req.params.id, req.body);
    res.status(httpStatus.OK).send({ review });
});

const GetReview = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getReview) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getReview not found');
    }
    const review = await ecommerceService.getReview(req.params.id);
    res.status(httpStatus.OK).send({ review });
});

const GetReviews = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getReviews) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getReviews not found');
    }
    const reviews = await ecommerceService.getReviews();
    res.status(httpStatus.OK).send({ reviews });
});

const DeleteReview = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteReview) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteReview not found');
    }
    await ecommerceService.deleteReview(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

// Wishlist CRUD
const CreateWishlist = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createWishlist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createWishlist not found');
    }
    const wishlist = await ecommerceService.createWishlist(req.body);
    res.status(httpStatus.CREATED).send({ wishlist });
});

const UpdateWishlist = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateWishlist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateWishlist not found');
    }
    const wishlist = await ecommerceService.updateWishlist(req.params.id, req.body);
    res.status(httpStatus.OK).send({ wishlist });
});

const GetWishlist = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getWishlist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getWishlist not found');
    }
    const wishlist = await ecommerceService.getWishlist(req.params.id);
    res.status(httpStatus.OK).send({ wishlist });
});

const GetWishlists = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getWishlists) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getWishlists not found');
    }
    const wishlists = await ecommerceService.getWishlists();
    res.status(httpStatus.OK).send({ wishlists });
});

const DeleteWishlist = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteWishlist) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteWishlist not found');
    }
    await ecommerceService.deleteWishlist(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

// Shipping CRUD
const CreateShipping = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.createShipping) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method createShipping not found');
    }
    const shipping = await ecommerceService.createShipping(req.body);
    res.status(httpStatus.CREATED).send({ shipping });
});

const UpdateShipping = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.updateShipping) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method updateShipping not found');
    }
    const shipping = await ecommerceService.updateShipping(req.params.id, req.body);
    res.status(httpStatus.OK).send({ shipping });
});

const GetShipping = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getShipping) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getShipping not found');
    }
    const shipping = await ecommerceService.getShipping(req.params.id);
    res.status(httpStatus.OK).send({ shipping });
});

const GetShippings = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.getShippings) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method getShippings not found');
    }
    const shippings = await ecommerceService.getShippings();
    res.status(httpStatus.OK).send({ shippings });
});

const DeleteShipping = catchAsync(async (req, res) => {
    const ecommerceService = loadService('ecommerceService');
    if (!ecommerceService.deleteShipping) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Method deleteShipping not found');
    }
    await ecommerceService.deleteShipping(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    CreateProduct,
    UpdateProduct,
    DeleteProduct,
    GetProduct,
    GetProducts,
    CreateVariation,
    UpdateVariation,
    DeleteVariation,
    GetVariation,
    GetVariations,
    CreateCollection,
    UpdateCollection,
    DeleteCollection,
    GetCollection,
    GetCollections,
    CreateCart,
    DeleteCart,
    GetCarts,
    GetCart,
    UpdateCart,
    CreateCategory,
    UpdateCategory,
    DeleteCategory,
    GetCategory,
    GetCategories,
    CreateOrder,
    UpdateOrder,
    GetOrder,
    GetOrders,
    DeleteOrder,
    GetMerchant,
    CreateMerchant,
    UpdateMerchant,
    DeleteMerchant,
    GetMerchants,
    GetBrand,
    CreateBrand,
    UpdateBrand,
    DeleteBrand,
    GetBrands,
    GetReview,
    CreateReview,
    UpdateReview,
    DeleteReview,
    GetReviews,
    GetWishlist,
    CreateWishlist,
    UpdateWishlist,
    DeleteWishlist,
    GetWishlists,
    GetShipping,
    CreateShipping,
    UpdateShipping,
    DeleteShipping,
    GetShippings,
};