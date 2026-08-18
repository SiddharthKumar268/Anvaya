// server/controllers/assetController.js

const User = require('../models/User')
const Asset = require('../models/Asset')

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

module.exports = { getTransferSteps, getNoNominationPath, getMinorProtection, checkLiability, getLockerAlert }