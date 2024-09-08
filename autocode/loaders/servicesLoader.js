
const ApiError = require('../utils/api-error')

const servicesInstance = require('../dist/autocode-services');

module.exports.loadService = async function(serviceName) {
    if (!servicesInstance[serviceName]) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
    }
    return servicesInstance[serviceName];
};