// server/controllers/calculatorController.js

const UDGAM_BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India']

const EMPLOYER_BENEFITS = {
  government: ['Family Pension Continuation', 'Gratuity (5+ yrs service)', 'Group Term Life Insurance', 'Unpaid Salary', 'Leave Encashment', 'CGHS/Medical Benefits'],
  private: ['Gratuity (5+ yrs service)', 'Group Term Life Insurance', 'Unpaid Salary', 'Leave Encashment', 'ESOP/RSU (if applicable)'],
  psu: ['Family Pension Continuation', 'Gratuity (5+ yrs service)', 'Group Term Life Insurance', 'Unpaid Salary', 'Leave Encashment', 'Provident Fund Settlement']
}

const PMJJBY_PMSBY_INFO = {
  pmjjby: {
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
    cover: 200000,
    premium: 436,
    type: 'life cover',
    checkSteps: ['Check bank passbook for auto-debit entry under PMJJBY', 'Ask bank if deceased was enrolled via linked savings account'],
    claimSteps: ['Get claim form from the bank branch', 'Attach death certificate + nominee ID + bank passbook', 'Submit to the enrolling bank branch']
  },
  pmsby: {
    name: 'Pradhan Mantri Suraksha Bima Yojana',
    cover: 200000,
    premium: 20,
    type: 'accidental cover only',
    checkSteps: ['Check bank passbook for auto-debit entry under PMSBY', 'Confirm death was accidental — this scheme does not cover natural death'],
    claimSteps: ['Get claim form from the bank branch', 'Attach FIR/post-mortem report (accidental death proof) + death certificate', 'Submit to the enrolling bank branch']
  }
}

const FD_CLOSURE_PROCESS = {
  'sbi': ['Visit home branch with death certificate + legal heir proof', 'Fill FD premature closure form as legal heir', 'Funds credited to nominee/legal heir account'],
  'hdfc bank': ['Submit death certificate + succession/nomination proof at branch', 'Request premature closure citing account holder death', 'No penalty typically charged on death claims'],
  default: ['Identify all FDs in deceased\'s name immediately — they auto-renew silently on maturity', 'Visit branch with death certificate + nominee/legal heir proof', 'Request premature closure as legal heir claim, not a normal withdrawal']
}

const calculateBenefits = async (req, res) => {
  const { lastSalary, yearsOfService, licSumAssured, fdPrincipal, fdRate, fdYears, pmjjbyEnrolled } = req.body

  const gratuity = lastSalary && yearsOfService
    ? Math.round((lastSalary * yearsOfService * 15) / 26)
    : 0

  const fdMaturity = fdPrincipal && fdRate && fdYears
    ? Math.round(fdPrincipal * Math.pow(1 + fdRate / 100, fdYears))
    : 0

  const pmjjbyPayout = pmjjbyEnrolled ? 200000 : 0
  const lic = licSumAssured || 0

  const total = gratuity + fdMaturity + pmjjbyPayout + lic

  res.json({
    breakdown: { gratuity, fdMaturity, pmjjbyPayout, lic },
    total
  })
}

const checkUdgam = async (req, res) => {
  const { bankName } = req.query
  const registered = UDGAM_BANKS.some((b) => b.toLowerCase() === (bankName || '').toLowerCase())

  res.json({
    registered,
    portalUrl: registered ? 'https://udgam.rbi.org.in' : null,
    iepfUrl: 'https://www.iepf.gov.in',
    message: registered
      ? 'This bank is on UDGAM — search unclaimed deposits using PAN or Aadhaar.'
      : 'Not listed on UDGAM. Contact the bank branch directly, or check IEPF for unclaimed dividends/shares.'
  })
}

const getPensionBenefits = async (req, res) => {
  const { employerType } = req.params
  const benefits = EMPLOYER_BENEFITS[employerType]

  if (!benefits) return res.status(400).json({ message: 'Unknown employer type' })
  res.json({ employerType, benefits })
}

const getPmjjbyGuide = async (req, res) => {
  res.json(PMJJBY_PMSBY_INFO)
}

const getFdBreaker = async (req, res) => {
  const { bankName } = req.query
  const key = (bankName || '').toLowerCase()
  const steps = FD_CLOSURE_PROCESS[key] || FD_CLOSURE_PROCESS.default

  res.json({ bankName: bankName || 'General', steps })
}

module.exports = { calculateBenefits, checkUdgam, getPensionBenefits, getPmjjbyGuide, getFdBreaker }