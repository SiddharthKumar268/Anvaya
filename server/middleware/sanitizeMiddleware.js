// server/middleware/sanitizeMiddleware.js

const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

const sanitize = [mongoSanitize(), xss()]
module.exports = sanitize