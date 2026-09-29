// server/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 minutes
  message: { message: 'Too many attempts, try again in 15 minutes' }
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // 2000 requests per 15 minutes to allow smooth multi-page browsing
  message: { message: 'Too many requests, slow down' }
})

module.exports = { authLimiter, generalLimiter }