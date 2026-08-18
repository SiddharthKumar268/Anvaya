// server/models/Claim.js

const mongoose = require('mongoose')

const claimSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  claimType: {
    type: String,
    enum: ['bank', 'lic', 'epf', 'property', 'postoffice', 'pmjjby', 'pmsby'],
    required: true
  },
  status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' },
  deadline: { type: Date }, // e.g. LIC 3-year claim window
  filedOn: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model('Claim', claimSchema)