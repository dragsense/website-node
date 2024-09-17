const dotenv = require('dotenv')
const path = require('path')

function getOsEnv(key) {
    if (typeof process.env[key] === 'undefined') {
        throw new Error(`Environment variable ${key} is not set.`)
    }

    return process.env[key]
}



/**
 * Load .env file or for tests the .env.test, .env.production file.
 */
dotenv.config({ path: path.join(process.cwd(), `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`) })

/**
 * Environment variables
 */

const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    autocodeApiKey: getOsEnv('AUTOCODE_API_KEY'),
    autocodeApiPrefix: getOsEnv('AUTOCODE_API_PREFIX'),
    protocol:process.env.APP_SCHEMA || 'https',
    database: {
        
        name: getOsEnv('DB_NAME'),
        mongouri: getOsEnv('DB_CONNECTION')
    },
}

module.exports = env
