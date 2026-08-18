// server/controllers/caseController.js

const mongoose = require('mongoose')
const Case = require('../models/Case')
const Document = require('../models/Document')
const Claim = require('../models/Claim')

const COMMON_DOCS = ['Death Certificate', 'Nominee ID Proof', 'PAN Card']

const DOC_RULES = {
  bank: ['Bank Passbook', 'Bank Account Closure Form'],
  lic: ['LIC Policy Bond', 'LIC Claim Form'],
  epf: ['UAN Number', 'EPF Claim Form'],
  property: ['Property Registration Papers', 'Legal Heir Certificate'],
  postoffice: ['Post Office Passbook'],
  demat: ['Demat Account Statement', 'Transmission Request Form'],
  fd: ['FD Receipt'],
  locker: ['Locker Agreement']
}

const CLAIM_TYPES = ['bank', 'lic', 'epf', 'postoffice']
const CLAIM_DEADLINE_DAYS = { lic: 3 * 365 }

// Helper: validate MongoDB ObjectId
function isValidId(id) {
  return id && id !== 'null' && id !== 'undefined' && mongoose.Types.ObjectId.isValid(id)
}

const createCase = async (req, res, next) => {
  try {
    const { assetsDeclared, hasLocker, nominee, deceased, priorities } = req.body

    // Map onboarding priorities to assetsDeclared format if sent from onboarding flow
    let assets = assetsDeclared || []
    let locker = hasLocker || false

    if (priorities && Array.isArray(priorities) && priorities.length > 0) {
      const priorityToAssetType = {
        bank: 'bank',
        insurance: 'lic',
        pension: 'epf',
        property: 'property',
        minor: 'bank',
        unsure: 'bank'
      }
      assets = priorities
        .map(p => priorityToAssetType[p])
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)  // deduplicate
        .map(type => ({ type, hasNomination: true }))
    }

    const newCase = await Case.create({
      userId: req.user._id,
      nominee: nominee || undefined,
      deceased: deceased || undefined,
      assetsDeclared: assets,
      hasLocker: locker
    })

    res.status(201).json({
      caseId: newCase._id,
      ...newCase.toObject()
    })
  } catch (err) {
    next(err)
  }
}

const getCase = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid case ID' })

    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ message: 'Case not found' })
    if (caseData.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this case' })
    }

    res.json(caseData)
  } catch (err) {
    next(err)
  }
}

const generateChecklist = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid case ID' })

    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ message: 'Case not found' })

    const docNames = new Set(COMMON_DOCS)
    caseData.assetsDeclared.forEach((asset) => {
      (DOC_RULES[asset.type] || []).forEach((doc) => docNames.add(doc))
    })

    const docs = await Promise.all(
      [...docNames].map((name) =>
        Document.findOneAndUpdate(
          { caseId: caseData._id, name },
          { caseId: caseData._id, name },
          { upsert: true, new: true }
        )
      )
    )

    res.json(docs)
  } catch (err) {
    next(err)
  }
}

const toggleDocument = async (req, res, next) => {
  try {
    if (!isValidId(req.params.docId)) return res.status(400).json({ message: 'Invalid document ID' })

    const doc = await Document.findById(req.params.docId)
    if (!doc) return res.status(404).json({ message: 'Document not found' })

    doc.collected = !doc.collected
    await doc.save()

    res.json(doc)
  } catch (err) {
    next(err)
  }
}

const generateClaims = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid case ID' })

    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ message: 'Case not found' })

    const relevantTypes = caseData.assetsDeclared
      .map((a) => a.type)
      .filter((type) => CLAIM_TYPES.includes(type))

    const claims = await Promise.all(
      relevantTypes.map((claimType) => {
        const deadline = CLAIM_DEADLINE_DAYS[claimType]
          ? new Date(Date.now() + CLAIM_DEADLINE_DAYS[claimType] * 86400000)
          : undefined

        return Claim.findOneAndUpdate(
          { caseId: caseData._id, claimType },
          { caseId: caseData._id, claimType, deadline },
          { upsert: true, new: true }
        )
      })
    )

    res.json(claims)
  } catch (err) {
    next(err)
  }
}

const getClaims = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid case ID' })

    const claims = await Claim.find({ caseId: req.params.id })
    res.json(claims)
  } catch (err) {
    next(err)
  }
}

const updateClaimStatus = async (req, res, next) => {
  try {
    if (!isValidId(req.params.claimId)) return res.status(400).json({ message: 'Invalid claim ID' })

    const { status } = req.body
    const claim = await Claim.findById(req.params.claimId)
    if (!claim) return res.status(404).json({ message: 'Claim not found' })

    claim.status = status
    if (status === 'done') claim.filedOn = new Date()
    await claim.save()

    res.json(claim)
  } catch (err) {
    next(err)
  }
}

const getDashboard = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid case ID' })

    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ message: 'Case not found' })

    const documents = await Document.find({ caseId: caseData._id })
    const claims = await Claim.find({ caseId: caseData._id })

    const docsCollected = documents.filter((d) => d.collected).length
    const claimsDone = claims.filter((c) => c.status === 'done').length
    const nextClaim = claims
      .filter((c) => c.status !== 'done' && c.deadline)
      .sort((a, b) => a.deadline - b.deadline)[0]

    res.json({
      documents: { collected: docsCollected, total: documents.length },
      claims: { done: claimsDone, total: claims.length },
      nextUrgentAction: nextClaim
        ? `File ${nextClaim.claimType.toUpperCase()} claim before ${nextClaim.deadline.toDateString()}`
        : null
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { createCase, getCase, generateChecklist, toggleDocument, generateClaims, getClaims, updateClaimStatus, getDashboard }