const httpStatus = require('http-status')

const catchAsync = require('../../utils/catch-async')
const { ecommerceService } = require('../services')

const CreateProduct = catchAsync(async (req, res) => {
    const product = await ecommerceService.createProduct(req.body);
    res.status(httpStatus.CREATED).send({ product });
});

const UpdateProduct = catchAsync(async (req, res) => {
    const product = await ecommerceService.updateProduct(req.params.id, req.body);
    res.status(httpStatus.CREATED).send({ product });
});

const DeleteProduct = catchAsync(async (req, res) => {
    const product = await ecommerceService.deleteProduct(req.params.id);
    res.status(httpStatus.CREATED).send({ product });
});

const GetProduct = catchAsync(async (req, res) => {
    const product = await ecommerceService.getProduct(req.params.id);
    res.status(httpStatus.OK).send({ product });
});

const GetProducts = catchAsync(async (req, res) => {
    const products = await ecommerceService.getProducts();
    res.status(httpStatus.OK).send({ products });
});

const CreateVariation= catchAsync(async (req, res) => {
    const variation = await ecommerceService.createVariation(req.body);
    res.status(httpStatus.CREATED).send({ variation });
});

const UpdateVariation= catchAsync(async (req, res) => {
    const variation = await ecommerceService.updateVariation(req.params.id, req.body);
    res.status(httpStatus.CREATED).send({ variation });
});

const DeleteVariation= catchAsync(async (req, res) => {
    const variation = await ecommerceService.deleteVariation(req.params.id);
    res.status(httpStatus.CREATED).send({ variation });
});

const GetVariation= catchAsync(async (req, res) => {
    const variation = await ecommerceService.getVariation(req.params.id);
    res.status(httpStatus.OK).send({ variation });
});

const GetVariations = catchAsync(async (req, res) => {
    const variations = await ecommerceService.getVariations();
    res.status(httpStatus.OK).send({ variations });
});


const CreateCollection = catchAsync(async (req, res) => {
    const collection = await ecommerceService.createCollection(req.body);
    res.status(httpStatus.CREATED).send({ collection });
});

const UpdateCollection = catchAsync(async (req, res) => {
    const collection = await ecommerceService.updateCollection(req.params.id, req.body);
    res.status(httpStatus.CREATED).send({ collection });
});

const DeleteCollection = catchAsync(async (req, res) => {
    const collection = await ecommerceService.deleteCollection(req.params.id);
    res.status(httpStatus.CREATED).send({ collection });
});

const GetCollection = catchAsync(async (req, res) => {
    const collection = await ecommerceService.getCollection(req.params.id);
    res.status(httpStatus.OK).send({ collection });
});

const GetCollections = catchAsync(async (req, res) => {
    const collections = await ecommerceService.getCollections();
    res.status(httpStatus.OK).send({ collections });
});

const CreateCart = catchAsync(async (req, res) => {
    const cartItem = await ecommerceService.createCart(req.body);
    res.status(httpStatus.CREATED).send({ cartItem });
});

const UpdateCart = catchAsync(async (req, res) => {
    const cartItem = await ecommerceService.updateCart(req.params.id, req.body);
    res.status(httpStatus.CREATED).send({ cartItem });
});

const GetCart = catchAsync(async (req, res) => {
    const cartItem = await ecommerceService.getCart(req.params.id);
    res.status(httpStatus.OK).send({ cartItem });
});

const DeleteCart = catchAsync(async (req, res) => {
    const cartItem = await ecommerceService.deleteCart(req.params.id);
    res.status(httpStatus.OK).send({ cartItem });
});

const GetCarts = catchAsync(async (req, res) => {
    const cartItems = await ecommerceService.getCarts();
    res.status(httpStatus.OK).send({ cartItems });
});

const CreateCategory = catchAsync(async (req, res) => {
    const category = await ecommerceService.createCategory(req.body);
    res.status(httpStatus.CREATED).send({ category });
});

const UpdateCategory = catchAsync(async (req, res) => {
    const category = await ecommerceService.updateCategory(req.params.id, req.body);
    res.status(httpStatus.CREATED).send({ category });
});

const DeleteCategory = catchAsync(async (req, res) => {
    const category = await ecommerceService.deleteCategory(req.params.id);
    res.status(httpStatus.CREATED).send({ category });
});

const GetCategory = catchAsync(async (req, res) => {
    const category = await ecommerceService.getCategory(req.params.id);
    res.status(httpStatus.OK).send({ category });
});

const GetCategories = catchAsync(async (req, res) => {
    const categories = await ecommerceService.getCategories();
    res.status(httpStatus.OK).send({ categories });
});

const CreateOrder = catchAsync(async (req, res) => {
    const order = await ecommerceService.createOrder(req.body);
    res.status(httpStatus.CREATED).send({ order });
});

const UpdateOrder = catchAsync(async (req, res) => {
    const order = await ecommerceService.updateOrder(req.params.id, req.body);
    res.status(httpStatus.OK).send({ order });
});

const GetOrder = catchAsync(async (req, res) => {
    const order = await ecommerceService.getOrder(req.params.id);
    res.status(httpStatus.OK).send({ order });
});

const GetOrders = catchAsync(async (req, res) => {
    const orders = await ecommerceService.getOrders();
    res.status(httpStatus.OK).send({ orders });
});

const DeleteOrder = catchAsync(async (req, res) => {
    const order = await ecommerceService.deleteOrder(req.params.id);
    res.status(httpStatus.CREATED).send({ order });
});




const GetMerchant = catchAsync(async (req, res) => {
    const merchant = await ecommerceService.getMerchant(req.params.id);
    res.status(httpStatus.OK).send({ merchant });
});

const CreateMerchant = catchAsync(async (req, res) => {
    const merchant = await ecommerceService.createMerchant(req.body);
    res.status(httpStatus.CREATED).send({ merchant });
});

const UpdateMerchant = catchAsync(async (req, res) => {
    const merchant = await ecommerceService.updateMerchant(req.params.id, req.body);
    res.status(httpStatus.OK).send({ merchant });
});

const DeleteMerchant = catchAsync(async (req, res) => {
    await ecommerceService.Merchant.deleteMerchant(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetMerchants = catchAsync(async (req, res) => {
    const merchants = await ecommerceService.getMerchants();
    res.status(httpStatus.OK).send({ merchants });
});


const GetBrand = catchAsync(async (req, res) => {
    const brand = await ecommerceService.getBrand(req.params.id);
    res.status(httpStatus.OK).send({ brand });
});

const CreateBrand = catchAsync(async (req, res) => {
    const brand = await ecommerceService.createBrand(req.body);
    res.status(httpStatus.CREATED).send({ brand });
});

const UpdateBrand = catchAsync(async (req, res) => {
    const brand = await ecommerceService.updateBrand(req.params.id, req.body);
    res.status(httpStatus.OK).send({ brand });
});

const DeleteBrand = catchAsync(async (req, res) => {
    await ecommerceService.Brand.deleteBrand(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetBrands = catchAsync(async (req, res) => {
    const brands = await ecommerceService.getBrands();
    res.status(httpStatus.OK).send({ brands });
});


const GetReview = catchAsync(async (req, res) => {
    const review = await ecommerceService.getReview(req.params.id);
    res.status(httpStatus.OK).send({ review });
});

const CreateReview = catchAsync(async (req, res) => {
    const review = await ecommerceService.createReview(req.body);
    res.status(httpStatus.CREATED).send({ review });
});

const UpdateReview = catchAsync(async (req, res) => {
    const review = await ecommerceService.updateReview(req.params.id, req.body);
    res.status(httpStatus.OK).send({ review });
});

const DeleteReview = catchAsync(async (req, res) => {
    await ecommerceService.Review.deleteReview(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetReviews = catchAsync(async (req, res) => {
    const reviews = await ecommerceService.getReviews();
    res.status(httpStatus.OK).send({ reviews });
});

const GetWishlist = catchAsync(async (req, res) => {
    const wishlist = await ecommerceService.getWishlist(req.params.id);
    res.status(httpStatus.OK).send({ wishlist });
});

const CreateWishlist = catchAsync(async (req, res) => {
    const wishlist = await ecommerceService.createWishlist(req.body);
    res.status(httpStatus.CREATED).send({ wishlist });
});

const UpdateWishlist = catchAsync(async (req, res) => {
    const wishlist = await ecommerceService.updateWishlist(req.params.id, req.body);
    res.status(httpStatus.OK).send({ wishlist });
});

const DeleteWishlist = catchAsync(async (req, res) => {
    await ecommerceService.Wishlist.deleteWishlist(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetWishlists = catchAsync(async (req, res) => {
    const wishlists = await ecommerceService.getWishlists();
    res.status(httpStatus.OK).send({ wishlists });
});

const GetShipping = catchAsync(async (req, res) => {
    const shipping = await ecommerceService.getShippingAddresses(req.params.id);
    res.status(httpStatus.OK).send({ shipping });
});

const CreateShipping = catchAsync(async (req, res) => {
    const shipping = await ecommerceService.createShippingAddress(req.body);
    res.status(httpStatus.CREATED).send({ shipping });
});

const UpdateShipping = catchAsync(async (req, res) => {
    const shipping = await ecommerceService.updateShippingAddress(req.params.id, req.body);
    res.status(httpStatus.OK).send({ shipping });
});

const DeleteShipping = catchAsync(async (req, res) => {
    await ecommerceService.deleteShippingAddress(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

const GetShippings = catchAsync(async (req, res) => {
    const shippings = await ecommerceService.getShippingAddresses();
    res.status(httpStatus.OK).send({ shippings });
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