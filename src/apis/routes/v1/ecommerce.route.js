const express = require('express')

const router = express.Router()
const { ecommerceController } = require('../../controllers')
const { ecommerceValidation } = require('../../validations');
const validate = require('../../../middlewares/validate');


router.post('/product', validate(ecommerceValidation.productSchema), ecommerceController.CreateProduct);
router.get('/products', ecommerceController.GetProducts);
router.get('/product/:id',  ecommerceController.GetProduct);
router.put('/product/:id', validate(ecommerceValidation.productSchema),  ecommerceController.UpdateProduct);
router.delete('/product/:id', ecommerceController.DeleteProduct);
//router.get('/product/category/:slug', ecommerceController.GetProductByCategory);
//router.get('/product/brand/:slug', ecommerceController.GetProductByBrand);

router.post('/variation',validate(ecommerceValidation.variationSchema),  ecommerceController.CreateVariation);
router.get('/variations', ecommerceController.GetVariations);
router.get('/variation/:id',  ecommerceController.GetVariation);
router.put('/variation/:id',validate(ecommerceValidation.variationSchema),   ecommerceController.UpdateVariation);
router.delete('/variation/:id', ecommerceController.DeleteVariation);

router.post('/collection',validate(ecommerceValidation.collectionSchema),  ecommerceController.CreateCollection);
router.get('/collections', ecommerceController.GetCollections);
router.get('/collection/:id',  ecommerceController.GetCollection);
router.put('/collection/:id', validate(ecommerceValidation.collectionSchema),  ecommerceController.UpdateCollection);
router.delete('/collection/:id', ecommerceController.DeleteCollection);

router.post('/category',validate(ecommerceValidation.categorySchema),  ecommerceController.CreateCategory);
router.get('/categories', ecommerceController.GetCategories);
router.get('/category/:id', ecommerceController.GetCategory);
router.put('/category/:id',validate(ecommerceValidation.categorySchema),  ecommerceController.UpdateCategory);
router.delete('/category/:id', ecommerceController.DeleteCategory);

router.post('/order',validate(ecommerceValidation.orderSchema),  ecommerceController.CreateOrder);
router.get('/orders', ecommerceController.GetOrders);
router.get('/order/:id', ecommerceController.GetOrder);
router.put('/order/:id',validate(ecommerceValidation.orderSchema),  ecommerceController.UpdateOrder);
router.delete('/order/:id', ecommerceController.DeleteOrder);
//router.delete('/order/cancel/:id', ecommerceController.CancelOrder);


router.post('/cart',validate(ecommerceValidation.cartSchema),  ecommerceController.CreateCart);
router.get('/carts', ecommerceController.GetCarts);
router.get('/cart/:id', ecommerceController.GetCart);
router.put('/cart/:id',validate(ecommerceValidation.cartSchema),  ecommerceController.UpdateCart);
router.delete('/cart/:id', ecommerceController.DeleteCart);
//router.post('/cart/add/:id',  ecommerceController.AddProductToCart);
//router.delete('/delete/:id/:productId', ecommerceController.RemoveProductFromCart);


router.post('/shippingaddress',validate(ecommerceValidation.shippingAddressSchema),  ecommerceController.CreateShipping);
router.get('/shippingaddresses', ecommerceController.GetShippings);
router.get('/shippingaddress/:id', ecommerceController.GetShipping);
router.put('/shippingaddress/:id', validate(ecommerceValidation.shippingAddressSchema), ecommerceController.UpdateShipping);
router.delete('/shippingaddress/:id', ecommerceController.DeleteShipping);

router.post('/merchant',validate(ecommerceValidation.merchantSchema),  ecommerceController.CreateMerchant);
router.get('/merchants', ecommerceController.GetMerchants);
router.get('/merchant/:id', ecommerceController.GetMerchant);
router.put('/merchant/:id',validate(ecommerceValidation.merchantSchema),  ecommerceController.UpdateMerchant);
router.delete('/merchant/:id', ecommerceController.DeleteMerchant);

router.post('/brand',validate(ecommerceValidation.brandSchema),  ecommerceController.CreateBrand);
router.get('/brands', ecommerceController.GetBrands);
router.get('/brand/:id', ecommerceController.GetBrand);
router.put('/brand/:id',validate(ecommerceValidation.brandSchema),  ecommerceController.UpdateBrand);
router.delete('/brand/:id', ecommerceController.DeleteBrand);

router.post('/review',validate(ecommerceValidation.reviewSchema),  ecommerceController.CreateReview);
router.get('/reviews', ecommerceController.GetReviews);
router.get('/review/:id', ecommerceController.GetReview);
router.put('/review/:id', validate(ecommerceValidation.reviewSchema), ecommerceController.UpdateReview);
router.delete('/review/:id', ecommerceController.DeleteReview);

router.post('/wishlist',validate(ecommerceValidation.wishlistSchema),  ecommerceController.CreateWishlist);
router.get('/wishlists', ecommerceController.GetWishlists);
router.get('/wishlist/:id', ecommerceController.GetWishlist);
router.put('/wishlist/:id',validate(ecommerceValidation.wishlistSchema),  ecommerceController.UpdateWishlist);
router.delete('/wishlist/:id', ecommerceController.DeleteWishlist);



module.exports = router

/**
 * @swagger
 * tags:
 *   name: Ecommerce
 *   description: Ecommerce management and retrieval
 */
