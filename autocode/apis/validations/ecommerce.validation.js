
const Joi = require('joi');

const productSchema = {
  body: Joi.object().keys({
    Name: Joi.string().trim().required(),
    Title: Joi.string().trim(),
    Description: Joi.string().trim(),
    Price: Joi.number().min(0).default(1),
    variations: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
    ImageUrl: Joi.string(),
    IsActive: Joi.boolean().default(true),
    Taxable: Joi.boolean().default(false),
    ImageId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    BrandId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    CategoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    MerchantId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    CreatorId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    updater: Joi.object().allow(null),
    creator: Joi.object().allow(null),
  })
}

const variationSchema  = {
  body: Joi.object().keys({
    color: Joi.string().required(),
    size: Joi.string().required(),
    price: Joi.number().required(),
    quantity: Joi.number().default(0),
  })
}

const collectionSchema  = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    products: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  })
}


const orderSchema = {
  body: Joi.object().keys({
    UserId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    CartId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    ShippingAddressId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    PaymentMethod: Joi.string().required(),
    Status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered'),
  })
}


const categorySchema = {
  body: Joi.object().keys({
    Name: Joi.string().required(),
    Description: Joi.string(),
    ImageUrl: Joi.string(),
    ImageId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    ProductId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    IsActive: Joi.boolean().default(true),
  })
}

const cartSchema = {
  body: Joi.object().keys({
    UserId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    Products: Joi.array()
      .items(
        Joi.object({
          ProductId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
          Quantity: Joi.number().required(),
        })
      )
      .required(),
    TotalItems: Joi.number().default(0),
    TotalAmount: Joi.number().default(0),
    TotalTax: Joi.number().default(0),
  })
}


const merchantSchema = {
  body: Joi.object().keys({
    Name: Joi.string().required(),
    Description: Joi.string(),
    Email: Joi.string().email().required(),
    Phone: Joi.string().required(),
    Address: Joi.string(),
    City: Joi.string(),
    State: Joi.string(),
    Country: Joi.string(),
    IsActive: Joi.boolean().default(true),
  })
}

const brandSchema = {
  body: Joi.object().keys({
    Name: Joi.string().required(),
    Description: Joi.string(),
    LogoUrl: Joi.string(),
    IsActive: Joi.boolean().default(true),
    MerchantId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  })
}

const reviewSchema = {
  body: Joi.object().keys({
    ProductId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    UserId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Title: Joi.string().trim(),
    Rating: Joi.number().default(0),
    Review: Joi.string().trim(),
    IsRecommended: Joi.boolean().default(true),
    Status: Joi.string().valid('Waiting Approval', 'Rejected', 'Approved').default('Waiting Approval'),
  })
}

const shippingAddressSchema = {
  body: Joi.object().keys({
    UserId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    AddressLine1: Joi.string().required(),
    AddressLine2: Joi.string(),
    City: Joi.string().required(),
    State: Joi.string().required(),
    PostalCode: Joi.string().required(),
    Country: Joi.string().required(),
    IsDefault: Joi.boolean().default(false),
  })
}

const wishlistSchema = {
  body: Joi.object().keys({
    UserId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    Products: Joi.array()
      .items(
        Joi.object({
          ProductId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
          AddedAt: Joi.date().default(Date.now),
        })
      )
      .required(),
    IsLiked: Joi.boolean().default(false),
  })
}

module.exports = {
  productSchema,
  variationSchema,
  collectionSchema,
  categorySchema,
  cartSchema,
  orderSchema,
  shippingAddressSchema,
  wishlistSchema,
  brandSchema,
  merchantSchema,
  reviewSchema
}