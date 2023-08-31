const httpStatus = require('http-status');
const ApiError = require('../utils/api-error')
const env = require('../configs/env')


const autocodeAPIAuth = (req, res, next) => {

    let api_key = req.header("x-api-key");
    if (api_key === env.autocodeApiKey) {
        next();
    } else {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

};


module.exports = autocodeAPIAuth;
