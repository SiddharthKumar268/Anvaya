// server/models/Document.js

const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  name: { type: String, required: true }, // e.g. "Death Certificate", "PAN Card"
  requiredFor: { type: String }, // which asset category triggered this doc
  collected: { type: Boolean, default: false },
  fileUrl: { type: String } // uploaded proof, if user attaches one
}, { timestamps: true })

module.exports = mongoose.model('Document', documentSchema)