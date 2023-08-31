const routeConfig = require('./apis/routes');
const clientLoader = require('./loaders/clientLoader');
module.exports = { 
    autocodeRoutes: routeConfig, 
    autocodeClient: clientLoader }
