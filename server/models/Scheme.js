// server/models/Scheme.js

const mongoose = require('mongoose')

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "PMJJBY", "Sukanya Samriddhi"
  category: { type: String, enum: ['insurance', 'postoffice', 'pension', 'other'] },
  description: { type: String },
  documentsRequired: [String],
  applicationUrl: { type: String }
})

module.exports = mongoose.model('Scheme', schemeSchema)