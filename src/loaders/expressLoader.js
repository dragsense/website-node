const compression = require('compression')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const morgan = require('morgan')
const xss = require('xss-clean')
const bodyParser = require('body-parser');

const env = require('../configs/env')
const { errorConverter, errorHandler } = require('../middlewares/error')
const { customizeLimiter } = require('../middlewares/rate-limit')
//const routeConfig = require('../apis/routes')


module.exports = (autocodeRoutes) => {
  const app = express()

  // set log request
  app.use(morgan('dev'))

  // set security HTTP headers
  app.use(helmet());

  const cspConfig = {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'",  "'unsafe-eval'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com", "https://fonts.googleapis.com"], // Allow styles from the same origin, unsafe-inline, and the specified CDN
      mediaSrc: ["https://youtu.be", "https://www.youtube.com"]
      // Add other directives as needed
    },
  };

   // Override CSP directive settings if needed
  app.use(helmet.contentSecurityPolicy(cspConfig));


  // parse json request body
  app.use(express.json())

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }))

  // sanitize request data
  //app.use(xss())
  //app.use(mongoSanitize())

  // gzip compression
  //app.use(compression())



  // set cors blocked resources
  app.use(cors())
  
  app.options('*', cors())

  

  // setup limits
  if (env.isProduction) {
    // app.use('/v1/auth', customizeLimiter)
  }


  // api routes
  app.use(env.app.routePrefix, autocodeRoutes)



  // convert error to ApiError, if needed
  app.use(errorConverter)

  // handle error
  app.use(errorHandler)



  app.listen(env.app.port)

  return app
}
