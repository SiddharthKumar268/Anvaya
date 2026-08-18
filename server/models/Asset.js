// server/models/Asset.js

const mongoose = require('mongoose')

const assetSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  category: {
    type: String,
    enum: ['bank', 'lic', 'epf', 'property', 'postoffice', 'demat', 'fd', 'locker'],
    required: true
  },
  institution: { type: String },
  accountNumber: { type: String },
  approximateValue: { type: Number },
  hasNomination: { type: Boolean, default: true },
  transferStatus: { type: String, enum: ['not-started', 'in-progress', 'transferred'], default: 'not-started' }
}, { timestamps: true })

module.exports = mongoose.model('Asset', assetSchema)