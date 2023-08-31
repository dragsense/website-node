const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Logger = require('./libs/logger')
const env = require('./configs/env')

const bannerLogger = require('./libs/banner')

const expressLoader = require('./loaders/expressLoader')
const { autocodeRoutes, autocodeClient } = require('../autocode/app');
import AppClient from './client/components';
import AutocodePage  from '../autocodeClient/server';

const mongooseLoader = require('./loaders/mongooseLoader')
const monitorLoader = require('./loaders/monitorLoader')
const passportLoader = require('./loaders/passportLoader')
const publicLoader = require('./loaders/publicLoader')
const winstonLoader = require('./loaders/winstonLoader')




const log = new Logger(__filename)

// Init loaders
async function initApp() {
    // logging
    winstonLoader()

    // Database
    await mongooseLoader()

    // express
    const app = expressLoader(autocodeRoutes)



    // monitor
    monitorLoader(app)


    // passport init
    passportLoader(app)

    // public Url
    publicLoader(app)

    
    autocodeClient(app,
        AutocodePage,
        AppClient,
        `app-client`
    )


}

initApp()
    .then(() => bannerLogger(log))
    .catch((error) => log.error('Application is crashed: ' + error))
