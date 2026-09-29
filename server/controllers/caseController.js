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

const Asset = require('../models/Asset')

const CLAIM_TYPES = ['bank', 'lic', 'epf', 'postoffice']
const CLAIM_DEADLINE_DAYS = { lic: 3 * 365, epf: 365, bank: 180, postoffice: 365 }

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

    if (assets.length === 0) {
      assets = [{ type: 'bank', hasNomination: true }, { type: 'lic', hasNomination: true }, { type: 'epf', hasNomination: true }]
    }

    const newCase = await Case.create({
      userId: req.user._id,
      nominee: nominee || undefined,
      deceased: deceased || undefined,
      assetsDeclared: assets,
      hasLocker: locker
    })

    // Auto-seed documents checklist
    try {
      const docNames = new Set(COMMON_DOCS)
      assets.forEach((asset) => {
        (DOC_RULES[asset.type] || []).forEach((doc) => docNames.add(doc))
      })
      await Promise.all(
        [...docNames].map((name) =>
          Document.create({ caseId: newCase._id, name, collected: name === 'Nominee ID Proof' })
        )
      )
    } catch (docErr) {
      console.warn('Auto-seed documents warning:', docErr.message)
    }

    // Auto-seed claims with statutory deadlines
    try {
      const relevantTypes = assets
        .map((a) => a.type)
        .filter((type) => CLAIM_TYPES.includes(type))
      const finalClaimTypes = relevantTypes.length > 0 ? relevantTypes : ['bank', 'lic']
      await Promise.all(
        finalClaimTypes.map((claimType) => {
          const deadline = CLAIM_DEADLINE_DAYS[claimType]
            ? new Date(Date.now() + CLAIM_DEADLINE_DAYS[claimType] * 86400000)
            : new Date(Date.now() + 180 * 86400000)
          return Claim.create({ caseId: newCase._id, claimType, status: 'pending', deadline })
        })
      )
    } catch (claimErr) {
      console.warn('Auto-seed claims warning:', claimErr.message)
    }

    // Auto-seed assets in Asset model
    try {
      const ASSET_TYPE_MAP = {
        bank: { name: 'Savings Account (Primary Bank)', type: 'Bank Accounts', category: 'bank', approximateValue: 345000, institution: 'State Bank of India', docsReq: 4, docsSubmitted: 2, status: 'In Progress', progress: 50 },
        lic: { name: 'Life Insurance Policy', type: 'Others', category: 'lic', approximateValue: 1000000, institution: 'Life Insurance Corporation', docsReq: 5, docsSubmitted: 1, status: 'In Progress', progress: 30 },
        epf: { name: 'EPFO / Provident Fund', type: 'Others', category: 'epf', approximateValue: 480000, institution: 'EPFO', docsReq: 3, docsSubmitted: 0, status: 'Not Started', progress: 0 },
        property: { name: 'Residential Property', type: 'Property', category: 'property', approximateValue: 4500000, institution: 'Sub-Registrar', docsReq: 6, docsSubmitted: 0, status: 'Not Started', progress: 0 },
        postoffice: { name: 'Post Office PPF Account', type: 'Others', category: 'postoffice', approximateValue: 320000, institution: 'India Post', docsReq: 4, docsSubmitted: 2, status: 'In Progress', progress: 50 },
        demat: { name: 'Demat Account Shares', type: 'Stocks/MF', category: 'demat', approximateValue: 250000, institution: 'Zerodha / CDSL', docsReq: 4, docsSubmitted: 0, status: 'Not Started', progress: 0 }
      }
      const assetSeeds = assets.map(a => {
        const def = ASSET_TYPE_MAP[a.type] || { name: `${a.type.toUpperCase()} Account`, type: 'Others', category: a.type, approximateValue: 200000, institution: 'Direct', docsReq: 3, docsSubmitted: 0, status: 'Not Started', progress: 0 }
        return {
          caseId: newCase._id,
          name: def.name,
          category: def.category,
          type: def.type,
          institution: def.institution,
          approximateValue: def.approximateValue,
          hasNomination: a.hasNomination !== undefined ? a.hasNomination : true,
          transferStatus: def.status,
          progress: def.progress,
          docsReq: def.docsReq,
          docsSubmitted: def.docsSubmitted
        }
      })
      if (assetSeeds.length > 0) {
        await Asset.insertMany(assetSeeds)
      }
    } catch (assetErr) {
      console.warn('Auto-seed assets warning:', assetErr.message)
    }

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

const generateAISummary = async (req, res, next) => {
  try {
    let caseData = null
    const paramId = req.params.id

    if (isValidId(paramId)) {
      caseData = await Case.findById(paramId)
    }

    if (!caseData && req.user && req.user._id) {
      caseData = await Case.findOne({ userId: req.user._id }).sort({ createdAt: -1 })
    }

    let summaryContext = null

    if (caseData) {
      const documents = await Document.find({ caseId: caseData._id })
      const claims = await Claim.find({ caseId: caseData._id })

      const docsCollected = documents.filter(d => d.collected).length
      const claimsDone = claims.filter(c => c.status === 'done').length
      const claimsInProgress = claims.filter(c => c.status === 'inProgress').length
      const claimsPending = claims.filter(c => c.status === 'pending').length

      summaryContext = {
        caseId: caseData._id,
        createdAt: caseData.createdAt,
        status: caseData.status,
        nominee: caseData.nominee || {},
        deceased: caseData.deceased || {},
        assetsDeclared: caseData.assetsDeclared || [],
        hasLocker: caseData.hasLocker,
        documents: {
          total: documents.length,
          collected: docsCollected,
          pending: documents.length - docsCollected,
          list: documents.map(d => ({ name: d.name, collected: d.collected }))
        },
        claims: {
          total: claims.length,
          done: claimsDone,
          inProgress: claimsInProgress,
          pending: claimsPending,
          list: claims.map(c => ({
            type: c.claimType,
            title: c.title || c.claimType,
            status: c.status,
            amount: c.estimatedAmount || 0,
            deadline: c.deadline,
            filedOn: c.filedOn
          }))
        }
      }
    } else if (req.body && (req.body.context || req.body.claims)) {
      // Live dashboard state context passed from frontend
      const ctx = req.body.context || req.body
      summaryContext = {
        nominee: ctx.nominee || { fullName: 'Primary Legal Nominee', relation: 'Spouse / Legal Heir' },
        deceased: ctx.deceased || { fullName: 'Late Account Holder' },
        assetsDeclared: ctx.assetsDeclared || [{ type: 'lic' }, { type: 'bank' }, { type: 'epf' }],
        documents: ctx.documents || { total: 50, collected: 36, pending: 14 },
        claims: ctx.claims || {
          total: 9,
          done: 3,
          inProgress: 3,
          pending: 3,
          list: [
            { type: 'lic', title: 'LIC Jeevan Anand Policy', status: 'pending', amount: 500000, deadline: '2026-09-21' },
            { type: 'epf', title: 'EPFO / PF & Pension Claim', status: 'pending', amount: 480000, deadline: '2026-09-28' },
            { type: 'bank', title: 'State Bank of India Savings', status: 'pending', amount: 290000, deadline: '2026-10-01' },
            { type: 'pmjjby', title: 'PMJJBY Life Insurance', status: 'done', amount: 200000 }
          ]
        }
      }
    } else {
      // Default fallback context
      summaryContext = {
        nominee: { fullName: 'Primary Nominee' },
        deceased: { fullName: 'Late Family Member' },
        documents: { total: 50, collected: 36, pending: 14 },
        claims: { total: 9, done: 3, inProgress: 3, pending: 3, list: [] }
      }
    }

    // Call Gemini for AI summary
    let aiSummary = null
    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview']

        const prompt = `You are Anvaya AI (अन्वय) — the leading intelligent financial recovery & asset succession engine for Indian nominee families.

Analyze the following case portfolio and generate a comprehensive, compassionate, and highly structured "Anvaya AI Case Executive Summary".

Case Context:
${JSON.stringify(summaryContext, null, 2)}

You MUST respond strictly with a valid JSON block matching this exact schema:
{
  "overallStatus": "On Track" | "Needs Attention" | "Critical Action Required",
  "completionPercent": <number between 0 and 100>,
  "summaryNarrative": "A warm, compassionate 3-4 sentence narrative explaining where the family stands in their recovery journey. Specifically mention 'Anvaya AI Case Summary' and the nominee/deceased names if available. Highlight milestones achieved and remaining hurdles.",
  "strengths": [
    "Specific positive milestone or compliance strength (e.g. 'All identity and KYC documents successfully verified in Anvaya Document Hub', 'LIC Life insurance claim successfully settled')"
  ],
  "risks": [
    "Specific risk, approaching limitation deadline, or missing document flag (e.g. 'EPFO Pension claim deadline approaching', 'Locker access requires branch visit within statutory window')"
  ],
  "nextSteps": [
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "action": "Clear, specific step (e.g., 'Submit LIC Form 3783 at nearest branch')",
      "deadline": "e.g., 'Within 7 Days' or 'Immediate Priority' or 'Next 2 Weeks'"
    }
  ],
  "estimatedTimeToCompletion": "e.g. '3-5 Weeks' or '6-8 Weeks'",
  "encouragement": "A short, warm, culturally respectful closing message of encouragement and support from Anvaya AI for the family."
}

Rules:
1. Return ONLY valid JSON inside \`\`\`json and \`\`\` or raw JSON with NO markdown commentary outside.
2. Accurately calculate the completion percentage based on documents verified and claims settled.
3. Be specific to the Indian legal/financial context (Nominee rights, IRDAI, EPFO, DEAF, Bank Form DA-2).`

        for (const modelName of CANDIDATE_MODELS) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: { responseMimeType: 'application/json' }
            })

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout: ${modelName} took >8s`)), 8000)
            )

            const result = await Promise.race([
              model.generateContent(prompt),
              timeoutPromise
            ])

            const text = result.response.text()
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
            const rawJson = jsonMatch ? jsonMatch[1].trim() : text.trim()
            aiSummary = JSON.parse(rawJson)
            console.log(`[Anvaya AI Summary] Generated successfully with ${modelName}`)
            break
          } catch (err) {
            console.warn(`[Anvaya AI Summary] Model ${modelName} failed (${err.message.slice(0, 80)}...), trying next...`)
          }
        }
      } catch (err) {
        console.warn('[Anvaya AI Summary] Gemini initialization/call error:', err.message)
      }
    }

    // Fallback heuristic summary if AI models fail or are busy
    if (!aiSummary) {
      const docTotal = (summaryContext.documents && summaryContext.documents.total) || 50
      const docCollected = (summaryContext.documents && summaryContext.documents.collected) || 36
      const claimTotal = (summaryContext.claims && summaryContext.claims.total) || 9
      const claimDone = (summaryContext.claims && summaryContext.claims.done) || 3
      const claimInProgress = (summaryContext.claims && summaryContext.claims.inProgress) || 3
      const claimPending = (summaryContext.claims && summaryContext.claims.pending) || 3

      const totalItems = docTotal + claimTotal
      const completedItems = docCollected + claimDone
      const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 10

      const deceasedName = (summaryContext.deceased && summaryContext.deceased.fullName) || 'Late Account Holder'
      const nomineeName = (summaryContext.nominee && summaryContext.nominee.fullName) || 'Legal Nominee'

      aiSummary = {
        overallStatus: pct >= 60 ? 'On Track' : (pct >= 30 ? 'Needs Attention' : 'Critical Action Required'),
        completionPercent: pct,
        summaryNarrative: `Case for ${deceasedName} is actively progressing under ${nomineeName}'s recovery roadmap. Out of ${docTotal} required statutory documents, ${docCollected} have been verified. There are ${claimTotal} declared recovery claims (${claimDone} settled, ${claimInProgress} in verification, ${claimPending} pending action).`,
        strengths: docCollected > 0
          ? [`${docCollected} essential statutory documents verified and ready for claim filing`, `Case profile established in Anvaya system`]
          : [`Case profile successfully initialized with declared asset portfolio`],
        risks: claimPending > 0
          ? [`${claimPending} claim(s) require immediate filing before limitation periods expire`, summaryContext.hasLocker ? '15-Day locker access protocol active' : 'Ensure all bank accounts are flagged to avoid DEAF pool transfer']
          : [`Maintain certified copies of all settlement discharge vouchers`],
        nextSteps: [
          {
            priority: 'HIGH',
            action: claimPending > 0 ? 'Submit pending claim applications to respective institutional branches' : 'Verify all pending documents in checklist',
            deadline: 'Within 7 Days'
          },
          {
            priority: 'MEDIUM',
            action: 'Track institutional verification SLAs with grievance escalation helpline',
            deadline: 'Next 15 Days'
          }
        ],
        estimatedTimeToCompletion: claimTotal > 3 ? '4-8 Weeks' : '2-4 Weeks',
        encouragement: 'Every verified document brings your family closer to complete financial closure and peace of mind. Anvaya is with you at every step.'
      }
    }

    res.json({
      success: true,
      caseId: summaryContext.caseId || undefined,
      summary: aiSummary,
      generatedAt: new Date().toISOString()
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createCase,
  getCase,
  generateChecklist,
  toggleDocument,
  generateClaims,
  getClaims,
  updateClaimStatus,
  getDashboard,
  generateAISummary
}