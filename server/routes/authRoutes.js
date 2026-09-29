// server/routes/authRoutes.js

const express = require('express')
const router = express.Router()
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController')
const { authLimiter } = require('../middleware/rateLimiter')

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

module.exports = router