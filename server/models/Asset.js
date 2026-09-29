// server/models/Asset.js

const mongoose = require('mongoose')

const assetSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['bank', 'lic', 'epf', 'property', 'postoffice', 'demat', 'fd', 'locker', 'gold', 'vehicle', 'other'],
    required: true
  },
  type: { type: String, default: 'Others' },
  institution: { type: String },
  accountNumber: { type: String },
  approximateValue: { type: Number, default: 0 },
  hasNomination: { type: Boolean, default: true },
  transferStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Documents Submitted', 'Under Review', 'Transferred', 'not-started', 'in-progress', 'transferred'],
    default: 'Not Started'
  },
  docsReq: { type: Number, default: 3 },
  docsSubmitted: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  source: { type: String, enum: ['manual', 'discovered'], default: 'manual' },
  confidence: { type: Number },
  evidence: { type: Array }
}, { timestamps: true })

module.exports = mongoose.model('Asset', assetSchema)