// server/controllers/authController.js

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { isAccountLocked, registerFailedAttempt, resetFailedAttempts, getLockRemainingMinutes } = require('../utils/accountLockout')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, state, dob, relationship, deceased } = req.body

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name, email, phone, state, dob, relationship, deceased,
      password: hashedPassword
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    if (isAccountLocked(user)) {
      return res.status(423).json({ message: `Account locked. Try again in ${getLockRemainingMinutes(user)} minute(s).` })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      await registerFailedAttempt(user)
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    await resetFailedAttempts(user)

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    })
  } catch (err) {
    next(err)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(404).json({ message: 'No account found with this email address' })

    res.json({
      success: true,
      message: 'Email verified. A verification code will be sent to your email.'
    })
  } catch (err) {
    next(err)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(404).json({ message: 'No account found with this email address' })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.failedLoginAttempts = 0
    user.lockUntil = undefined
    await user.save()

    res.json({
      success: true,
      message: 'Password reset successfully. You can now sign in.'
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, forgotPassword, resetPassword }