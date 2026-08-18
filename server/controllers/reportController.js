// server/controllers/reportController.js

const mongoose = require('mongoose')
const Case = require('../models/Case')
const Document = require('../models/Document')
const Claim = require('../models/Claim')

function isValidId(id) {
  return id && id !== 'null' && id !== 'undefined' && mongoose.Types.ObjectId.isValid(id)
}

// GET /reports/summary/:caseId
const getReportSummary = async (req, res, next) => {
  try {
    const { caseId } = req.params

    if (!isValidId(caseId)) {
      return res.status(400).json({ message: 'Invalid case ID' })
    }

    const caseData = await Case.findById(caseId)
    if (!caseData) return res.status(404).json({ message: 'Case not found' })

    // Ownership check
    if (caseData.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this case' })
    }

    // Fetch all documents and claims for this case
    const documents = await Document.find({ caseId: caseData._id }).sort({ createdAt: 1 })
    const claims = await Claim.find({ caseId: caseData._id }).sort({ createdAt: 1 })

    // --- Document stats ---
    const docsCollected = documents.filter(d => d.collected).length
    const docsTotal = documents.length
    const docsPercent = docsTotal > 0 ? Math.round((docsCollected / docsTotal) * 100) : 0

    // --- Claim stats ---
    const claimsDone = claims.filter(c => c.status === 'done').length
    const claimsInProgress = claims.filter(c => c.status === 'in-progress').length
    const claimsPending = claims.filter(c => c.status === 'pending').length
    const claimsTotal = claims.length
    const claimsPercent = claimsTotal > 0 ? Math.round((claimsDone / claimsTotal) * 100) : 0

    // --- Assets stats (from case declaration) ---
    const assetsTotal = caseData.assetsDeclared ? caseData.assetsDeclared.length : 0
    // No transfer tracking yet, so we estimate based on claim completion
    const assetsWithClaims = claims.filter(c => c.status === 'done').length
    const assetsPercent = assetsTotal > 0 ? Math.round((assetsWithClaims / assetsTotal) * 100) : 0

    // --- Overall progress (weighted: docs 30%, claims 50%, assets 20%) ---
    const overallPercent = Math.round(
      (docsPercent * 0.3) + (claimsPercent * 0.5) + (assetsPercent * 0.2)
    )

    // --- Module breakdown ---
    const modules = [
      { title: 'Documents', collected: docsCollected, total: docsTotal, percent: docsPercent },
      { title: 'Claims', collected: claimsDone, total: claimsTotal, percent: claimsPercent },
      { title: 'Assets', collected: assetsWithClaims, total: assetsTotal, percent: assetsPercent }
    ]

    // --- Build timeline from real data ---
    const timeline = []

    // Case creation
    timeline.push({
      date: caseData.createdAt,
      content: 'Case created',
      status: 'completed'
    })

    // First document generated
    if (documents.length > 0) {
      timeline.push({
        date: documents[0].createdAt,
        content: `Documents checklist generated (${docsTotal} documents)`,
        status: 'completed'
      })
    }

    // Document collection milestones
    const collectedDocs = documents.filter(d => d.collected).sort((a, b) => a.updatedAt - b.updatedAt)
    collectedDocs.forEach(doc => {
      timeline.push({
        date: doc.updatedAt,
        content: `${doc.name} collected`,
        status: 'completed'
      })
    })

    // Claim events
    claims.forEach(claim => {
      if (claim.status === 'done') {
        timeline.push({
          date: claim.filedOn || claim.updatedAt,
          content: `${claim.claimType.toUpperCase()} claim completed`,
          status: 'completed'
        })
      } else if (claim.status === 'in-progress') {
        timeline.push({
          date: claim.updatedAt || claim.createdAt,
          content: `${claim.claimType.toUpperCase()} claim in progress`,
          status: 'active'
        })
      } else {
        // Pending claims with deadlines become future milestones
        if (claim.deadline) {
          timeline.push({
            date: claim.deadline,
            content: `${claim.claimType.toUpperCase()} claim deadline`,
            status: 'future'
          })
        }
      }
    })

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date))

    // --- Pending documents as upcoming items ---
    const pendingDocs = documents.filter(d => !d.collected)

    res.json({
      caseId: caseData._id,
      caseCreatedAt: caseData.createdAt,
      overallPercent,
      modules,
      documents: {
        collected: docsCollected,
        total: docsTotal,
        percent: docsPercent,
        pending: pendingDocs.map(d => d.name)
      },
      claims: {
        done: claimsDone,
        inProgress: claimsInProgress,
        pending: claimsPending,
        total: claimsTotal,
        percent: claimsPercent
      },
      assets: {
        transferred: assetsWithClaims,
        total: assetsTotal,
        percent: assetsPercent
      },
      timeline
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getReportSummary }
