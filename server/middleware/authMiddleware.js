// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token = req.headers.authorization

  if (!token || !token.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    token = token.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}

const optionalAuth = async (req, res, next) => {
  let token = req.headers.authorization
  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    } catch (err) {
      // proceed without req.user
    }
  }
  next()
}

module.exports = { protect, optionalAuth }