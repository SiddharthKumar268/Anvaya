// server/models/User.js

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  state: { type: String },
  dob: { type: Date },
  relationship: {
    type: String,
    enum: ['widow', 'widower', 'son', 'daughter', 'parent', 'other']
  },
  deceased: {
    name: { type: String },
    dod: { type: Date },
    employmentType: {
      type: String,
      enum: ['government', 'private', 'self-employed', 'other']
    }
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)