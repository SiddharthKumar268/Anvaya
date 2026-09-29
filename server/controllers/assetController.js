// server/controllers/assetController.js

const mongoose = require('mongoose')
const User = require('../models/User')
const Asset = require('../models/Asset')
const Case = require('../models/Case')

const TRANSFER_STEPS = {
  property: ['Apply for mutation at local municipal/revenue authority', 'Submit death certificate + legal heir proof + property papers', 'State-wise fee and timeline vary — check local authority'],
  demat: ['Submit transmission request form to the broker (Zerodha/Groww/CDSL/NSDL)', 'Attach death certificate + nominee ID + demat statement', 'Shares transferred to nominee demat account'],
  bank: ['Visit branch with death certificate + nominee KYC', 'Fill account closure/transfer form', 'Funds moved to nominee account'],
  locker: ['Visit branch within 15 days of death notice', 'Submit death certificate + locker key + nominee ID', 'Locker contents inventoried and handed over']
}

const getTransferSteps = async (req, res) => {
  const { assetType } = req.params
  const steps = TRANSFER_STEPS[assetType]

  if (!steps) return res.status(400).json({ message: 'No transfer guide for this asset type' })
  res.json({ assetType, steps })
}

const NO_NOMINATION_PATH = {
  legalHeirCertificate: { issuedBy: 'Tehsildar/SDM', timeline: '1-2 months', usedFor: 'Bank accounts, small claims' },
  successionCertificate: { issuedBy: 'Civil Court', timeline: '6 months - 2 years', usedFor: 'Property, large claims, disputed cases' },
  steps: [
    'Determine if a Legal Heir Certificate is enough (usually sufficient for banks)',
    'If property or high-value/disputed assets are involved, file for Succession Certificate in civil court',
    'Use the certificate as proof of heirship for all asset-specific claims'
  ]
}

const getNoNominationPath = async (req, res) => {
  res.json(NO_NOMINATION_PATH)
}

const getMinorProtection = async (req, res) => {
  const user = await User.findById(req.user._id)
  const age = Math.floor((Date.now() - user.dob) / 31557600000)
  const isMinor = age < 18

  res.json({
    isMinor,
    guide: isMinor
      ? {
          message: 'Nominee is a minor — a court-appointed guardian must manage assets until age 18.',
          steps: ['Apply for guardian appointment in civil court', 'Assets held in trust under guardian until nominee turns 18', 'Guardian can access funds for nominee welfare with court permission'],
          yearsUntilAdult: 18 - age
        }
      : { message: 'Nominee is a major — no guardian required.' }
  })
}

const LOAN_LIABILITY = {
  home: { familyLiable: true, note: 'Bank can attach the mortgaged property if EMIs stop, but legal heirs are only liable up to the value of inherited assets.' },
  personal: { familyLiable: false, note: 'Legal heirs are generally not liable for unsecured personal loans, though lenders often pressure families anyway.' },
  creditCard: { familyLiable: false, note: 'Outstanding credit card dues die with the borrower unless there was a co-applicant.' },
  joint: { familyLiable: true, note: 'Co-applicant becomes the sole borrower and is fully liable for the remaining loan.' }
}

const checkLiability = async (req, res) => {
  const { loanType } = req.params
  const info = LOAN_LIABILITY[loanType]

  if (!info) return res.status(400).json({ message: 'Unknown loan type' })
  res.json({ loanType, ...info })
}

const getLockerAlert = async (req, res) => {
  const { deathNoticeDate } = req.query
  if (!deathNoticeDate) return res.status(400).json({ message: 'deathNoticeDate is required' })

  const sealDate = new Date(new Date(deathNoticeDate).getTime() + 15 * 86400000)
  const daysLeft = Math.ceil((sealDate - Date.now()) / 86400000)

  res.json({
    sealDate,
    daysLeft,
    urgent: daysLeft <= 5,
    steps: ['Visit the branch before the 15-day seal deadline', 'Carry death certificate + locker key + nominee ID', 'Request locker access before it gets sealed — reopening after sealing needs a longer legal process']
  })
}

// ─── Asset CRUD Controllers ──────────────────────────────────────────

const createAsset = async (req, res, next) => {
  try {
    let { caseId, name, category, type, institution, accountNumber, approximateValue, hasNomination, transferStatus, docsReq, docsSubmitted } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Asset name is required' })
    }

    let targetCase = null
    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      targetCase = await Case.findById(caseId)
    }
    if (!targetCase && req.user && req.user._id) {
      targetCase = await Case.findOne({ userId: req.user._id }).sort({ createdAt: -1 })
    }

    if (!targetCase) {
      if (req.user && req.user._id) {
        targetCase = await Case.create({
          userId: req.user._id,
          assetsDeclared: []
        })
      } else {
        return res.status(400).json({ message: 'Valid case ID or active authenticated user is required' })
      }
    }

    const typeToCategory = {
      'Bank Accounts': 'bank',
      'Property': 'property',
      'Stocks/MF': 'demat',
      'Fixed Deposits': 'fd',
      'Gold': 'gold',
      'Vehicles': 'vehicle',
      'Others': 'other'
    }

    if (!category && type && typeToCategory[type]) {
      category = typeToCategory[type]
    }
    if (!category) category = 'other'

    const catToType = {
      bank: 'Bank Accounts',
      property: 'Property',
      demat: 'Stocks/MF',
      fd: 'Fixed Deposits',
      gold: 'Gold',
      vehicle: 'Vehicles',
      lic: 'Others',
      epf: 'Others',
      postoffice: 'Others',
      locker: 'Others',
      other: 'Others'
    }
    if (!type) type = catToType[category] || 'Others'

    const numValue = Number(approximateValue) || 0
    const reqDocs = Number(docsReq) || 3
    const subDocs = Number(docsSubmitted) || 0
    let prog = 0
    if (transferStatus === 'Transferred' || transferStatus === 'transferred') {
      prog = 100
    } else if (reqDocs > 0 && subDocs > 0) {
      prog = Math.min(100, Math.round((subDocs / reqDocs) * 100))
    }

    const newAsset = await Asset.create({
      caseId: targetCase._id,
      name,
      category,
      type,
      institution: institution || '',
      accountNumber: accountNumber || '',
      approximateValue: numValue,
      hasNomination: hasNomination !== undefined ? !!hasNomination : true,
      transferStatus: transferStatus || 'Not Started',
      docsReq: reqDocs,
      docsSubmitted: subDocs,
      progress: prog
    })

    // Sync with Case.assetsDeclared if category not already declared
    if (targetCase.assetsDeclared && Array.isArray(targetCase.assetsDeclared)) {
      const existing = targetCase.assetsDeclared.find(a => a.type === category)
      if (!existing) {
        targetCase.assetsDeclared.push({ type: category, hasNomination: newAsset.hasNomination })
        await targetCase.save()
      }
    }

    res.status(201).json(newAsset)
  } catch (err) {
    next(err)
  }
}

const getAssets = async (req, res, next) => {
  try {
    let caseId = req.params.caseId || req.query.caseId

    let query = {}
    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      query.caseId = caseId
    } else if (req.user && req.user._id) {
      const userCases = await Case.find({ userId: req.user._id }).select('_id')
      const caseIds = userCases.map(c => c._id)
      query.caseId = { $in: caseIds }
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 })
    res.json(assets)
  } catch (err) {
    next(err)
  }
}

const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid asset ID' })
    }

    const asset = await Asset.findById(id)
    if (!asset) return res.status(404).json({ message: 'Asset not found' })

    const fields = ['name', 'category', 'type', 'institution', 'accountNumber', 'approximateValue', 'hasNomination', 'transferStatus', 'docsReq', 'docsSubmitted', 'progress']
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        asset[field] = req.body[field]
      }
    })

    if (asset.transferStatus === 'Transferred' || asset.transferStatus === 'transferred') {
      asset.progress = 100
      if (asset.docsSubmitted < asset.docsReq) asset.docsSubmitted = asset.docsReq
    } else if (asset.docsReq > 0 && asset.docsSubmitted >= 0) {
      asset.progress = Math.min(100, Math.round((asset.docsSubmitted / asset.docsReq) * 100))
    }

    await asset.save()
    res.json(asset)
  } catch (err) {
    next(err)
  }
}

const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid asset ID' })
    }

    const deleted = await Asset.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Asset not found' })

    res.json({ message: 'Asset deleted successfully', id })
  } catch (err) {
    next(err)
  }
}

// ─── AI Legal Letter Drafter ─────────────────────────────────────────
const draftAssetLetter = async (req, res, next) => {
  try {
    const {
      assetId,
      assetName,
      category,
      type,
      institution,
      accountNumber,
      approximateValue,
      hasNomination,
      letterType = 'claim',
      nomineeName,
      nomineeRelation,
      deceasedName,
      dateOfDeath
    } = req.body

    let assetData = null
    let caseData = null

    if (assetId && mongoose.Types.ObjectId.isValid(assetId)) {
      assetData = await Asset.findById(assetId)
      if (assetData && assetData.caseId) {
        caseData = await Case.findById(assetData.caseId)
      }
    }

    if (!caseData && req.user && req.user._id) {
      caseData = await Case.findOne({ userId: req.user._id }).sort({ createdAt: -1 })
    }

    const resolvedAsset = {
      name: assetName || (assetData && assetData.name) || 'Financial Asset',
      category: category || (assetData && assetData.category) || 'bank',
      type: type || (assetData && assetData.type) || 'Bank Accounts',
      institution: institution || (assetData && assetData.institution) || 'Authorized Branch',
      accountNumber: accountNumber || (assetData && assetData.accountNumber) || 'XXXX-XXXX',
      value: approximateValue || (assetData && assetData.approximateValue) || 0,
      hasNomination: hasNomination !== undefined ? hasNomination : ((assetData && assetData.hasNomination) ?? true)
    }

    const nominee = {
      name: nomineeName || (caseData && caseData.nominee && caseData.nominee.fullName) || (req.user && req.user.name) || 'Primary Legal Nominee',
      relation: nomineeRelation || (caseData && caseData.nominee && caseData.nominee.relation) || 'Legal Heir / Nominee'
    }

    const deceased = {
      name: deceasedName || (caseData && caseData.deceased && caseData.deceased.fullName) || 'Late Family Member',
      dateOfDeath: dateOfDeath || (caseData && caseData.deceased && caseData.deceased.dod ? new Date(caseData.deceased.dod).toDateString() : 'Recent')
    }

    const letterTypeTitles = {
      claim: 'Formal Application for Settlement of Deceased Account / Asset',
      transmission: 'Application for Transmission of Securities & Account Closure',
      noc: 'Legal Heir No-Objection & Consent Declaration (Annexure)'
    }
    const selectedTitle = letterTypeTitles[letterType] || letterTypeTitles.claim

    let letterResult = null
    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash']

        const prompt = `You are Anvaya AI (अन्वय), the premier legal and financial recovery succession assistant for Indian nominee families.

Draft an impeccably structured, formal, and authoritative institutional legal application letter ready for submission by the nominee to an Indian financial institution or authority.

Details:
- Letter Purpose: ${selectedTitle} (${letterType})
- Asset Name: ${resolvedAsset.name}
- Category: ${resolvedAsset.category} (${resolvedAsset.type})
- Institution: ${resolvedAsset.institution}
- Account / Folio / Policy / Identifier No: ${resolvedAsset.accountNumber}
- Approximate Valuation: ₹${Number(resolvedAsset.value).toLocaleString('en-IN')}
- Nomination Registered: ${resolvedAsset.hasNomination ? 'YES (Registered Nominee under statutory rules)' : 'NO (Claim under Indian Succession Act / Legal Heir rules)'}
- Deceased Name: ${deceased.name} (Late)
- Date of Death: ${deceased.dateOfDeath}
- Applicant / Nominee Name: ${nominee.name}
- Relation to Deceased: ${nominee.relation}

Guidelines:
1. Follow standard Indian banking/institutional correspondence format:
   - Date placeholder: [Today's Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}]
   - To: The Branch Manager / Authorized Officer, ${resolvedAsset.institution}
   - Subject: Clear reference with Account/Folio No and deceased name citing relevant Indian laws (e.g., Section 45ZA of Banking Regulation Act 1949 / RBI Master Direction on Deceased Depositors / SEBI circular for transmission).
   - Salutation: Respected Sir / Madam,
   - Precise statement of facts, nominee status, demand for transfer/settlement of proceeds to nominee's savings account.
   - Comprehensive Checklist of Enclosures (Certified Death Certificate, KYC of Nominee, Original Passbook/Bond, Form DA-2 / Transmission Form, Indemnity Bond).
   - Sign-off block with Applicant details.
2. Return strictly a JSON object:
{
  "letterTitle": "${selectedTitle}",
  "letterContent": "The complete, ready-to-print formatted text with clean line breaks.",
  "statutoryNotes": "A short 1-2 sentence actionable legal advice regarding stamp duty, branch visit SLAs, or notarization."
}`

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
            letterResult = JSON.parse(rawJson)
            break
          } catch (err) {
            console.warn(`[AI Letter Drafter] Model ${modelName} failed:`, err.message)
          }
        }
      } catch (err) {
        console.warn('[AI Letter Drafter] Gemini init failed:', err.message)
      }
    }

    // High-quality fallback legal template if Gemini is unavailable
    if (!letterResult) {
      const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      const legalRef = resolvedAsset.hasNomination
        ? 'Section 45ZA to 45ZF of the Banking Regulation Act, 1949 and RBI Master Direction on Deceased Depositors'
        : 'Sections 214 & 370 of the Indian Succession Act, 1925 / Institutional Non-Nomination Settlement Guidelines'

      const fallbackContent = `Date: ${todayStr}

To,
The Branch Manager / Competent Authority,
${resolvedAsset.institution},
[Branch Address / City]

Subject: Application for Settlement & Transmission of Deceased Account / Asset — ${resolvedAsset.name} (A/c / Ref: ${resolvedAsset.accountNumber})

Respected Sir / Madam,

I, ${nominee.name}, residing at [Address], respectfully submit this formal application for the release and settlement of proceeds / transmission of the following asset held in the name of my late ${nominee.relation.toLowerCase()}, ${deceased.name}:

Asset Details:
1. Asset Name / Title: ${resolvedAsset.name}
2. Account / Folio / Policy Number: ${resolvedAsset.accountNumber}
3. Estimated Value: ₹${Number(resolvedAsset.value).toLocaleString('en-IN')}
4. Nomination Status: ${resolvedAsset.hasNomination ? 'Nominee Registered in institutional records' : 'Settlement under Legal Heirship / Indemnity'}

It is with deep sorrow that I inform you that the account holder, ${deceased.name}, departed for their heavenly abode on ${deceased.dateOfDeath}. An original verified copy of the Death Certificate issued by the competent municipal registrar is enclosed herewith for your records.

In accordance with ${legalRef}, I hereby request you to settle the outstanding balance and accrued interest/benefits and transfer the proceeds to my bank account as detailed below:

Nominee Bank Details for Settlement:
- Account Holder Name: ${nominee.name}
- Bank Name: [Nominee Bank Name]
- Account Number: [Nominee Account Number]
- IFSC Code: [IFSC Code]

List of Enclosed Documents:
1. Certified copy of Death Certificate (Issued by Municipal Authority)
2. Self-attested PAN Card & Aadhaar Card of Claimant / Nominee
3. Original Passbook / Deposit Receipt / Statement / Policy Bond
4. Duly completed Deceased Claim Form (Form DA-2 / Institutional Claim Format)
5. ${resolvedAsset.hasNomination ? 'Discharge Receipt by Nominee' : 'Letter of Disclaimer / NOC from other legal heirs & Indemnity Bond'}

Kindly acknowledge receipt of this application on the duplicate copy and process the settlement within the stipulated statutory service turnaround time (15 days under RBI citizen charter).

Thanking you.

Yours faithfully,

_____________________________
${nominee.name}
(Relationship: ${nominee.relation} of Late ${deceased.name})
Mobile No.: [Your Phone Number]
Email Address: [Your Email]
Address: [Your Residential Address]`

      letterResult = {
        letterTitle: selectedTitle,
        letterContent: fallbackContent,
        statutoryNotes: resolvedAsset.hasNomination
          ? 'Under RBI Master Directions, banks must not demand a succession certificate or probate where a valid nomination exists and no court injunction has been served.'
          : 'For non-nomination claims up to ₹5,00,000, most banks allow settlement with KYC, Death Certificate, and an Indemnity Bond with two guarantors without requiring a civil court Succession Certificate.'
      }
    }

    res.json({
      success: true,
      ...letterResult,
      isAI: !!apiKey,
      generatedAt: new Date().toISOString()
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getTransferSteps,
  getNoNominationPath,
  getMinorProtection,
  checkLiability,
  getLockerAlert,
  createAsset,
  getAssets,
  updateAsset,
  deleteAsset,
  draftAssetLetter
}