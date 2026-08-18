// server/models/Case.js

const mongoose = require('mongoose')

const caseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nominee: {
    fullName: { type: String },
    relation: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  deceased: {
    fullName: { type: String },
    dateOfPassing: { type: String },
    hasCertificate: { type: Boolean }
  },
  assetsDeclared: [{
    type: { type: String, enum: ['bank', 'lic', 'epf', 'property', 'postoffice', 'demat', 'fd', 'locker'] },
    hasNomination: { type: Boolean, default: true }
  }],
  hasLocker: { type: Boolean, default: false }, // triggers 15-day seal alert
  status: { type: String, enum: ['active', 'closed'], default: 'active' }
}, { timestamps: true })

module.exports = mongoose.model('Case', caseSchema)