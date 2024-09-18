
const ApiError = require('../utils/api-error')

const servicesInstance = require('../apis/services');

module.exports.loadService = function(serviceName) {
    if (!servicesInstance[serviceName]) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
    }
    return servicesInstance[serviceName];
};