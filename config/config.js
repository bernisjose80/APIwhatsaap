require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'dev',
    port: process.env.PORT || 5000,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    tokenWebhook: process.env.TOKEN_WEBHOOK,
    tokenApp: process.env.TOKEN_APP,
    urlApi: process.env.URL_API 
}

module.exports = { config };