// server/controllers/discoveryController.js

const mongoose = require('mongoose')
const { analyze } = require('../services/discoveryService')
const Asset = require('../models/Asset')
const Claim = require('../models/Claim')
const Case = require('../models/Case')

const run = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV bank statement' })
    }
    const leads = analyze(req.file.buffer)
    res.json({ leads, count: leads.length })
  } catch (err) {
    next(err)
  }
}

const confirmLead = async (req, res, next) => {
  try {
    const { kind, label, merchant, avgAmount, confidence, evidence, interval } = req.body

    if (!kind || !label) {
      return res.status(400).json({ message: 'Lead kind and label are required' })
    }

    // Map discovery kind to asset category
    const kindToCategory = {
      insurance: 'lic',
      mutualfund: 'demat',
      liability: 'other',
      demat: 'demat',
      savings: 'postoffice',
      employer: 'epf',
      property: 'property'
    }

    // Map discovery kind to claim type
    const kindToClaimType = {
      insurance: 'lic',
      mutualfund: 'bank',
      liability: 'bank',
      demat: 'bank',
      savings: 'postoffice',
      employer: 'epf',
      property: 'property'
    }

    // Find or create a case for the user
    let targetCase = null
    const userId = req.user && req.user._id
    if (userId) {
      targetCase = await Case.findOne({ userId }).sort({ createdAt: -1 })
      if (!targetCase) {
        targetCase = await Case.create({
          userId,
          assetsDeclared: []
        })
      }
    } else if (req.body.caseId && mongoose.Types.ObjectId.isValid(req.body.caseId)) {
      targetCase = await Case.findById(req.body.caseId)
    }

    if (!targetCase) {
      targetCase = await Case.findOne().sort({ createdAt: -1 })
    }

    const category = kindToCategory[kind] || 'other'

    const asset = await Asset.create({
      caseId: targetCase._id,
      name: `${label} — ${merchant}`,
      category,
      type: label,
      institution: merchant,
      approximateValue: avgAmount || 0,
      hasNomination: true,
      transferStatus: 'Not Started',
      source: 'discovered',
      confidence,
      evidence: evidence || []
    })

    const claimType = kindToClaimType[kind] || 'bank'
    const claim = await Claim.create({
      caseId: targetCase._id,
      assetId: asset._id,
      claimType,
      status: 'pending'
    })

    res.status(201).json({
      message: 'Lead confirmed — Asset and Claim created',
      asset,
      claim
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { run, confirmLead }
