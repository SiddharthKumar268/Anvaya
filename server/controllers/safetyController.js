// server/controllers/safetyController.js

const SCAM_LIBRARY = [
  { type: 'Fake Agent', redFlag: 'Claims to "speed up" LIC/PF claims for a fee', reportTo: 'IRDAI / EPFO Vigilance' },
  { type: 'Overcharging Lawyer', redFlag: 'Quotes inflated fees for a simple Legal Heir/Succession Certificate', reportTo: 'State Bar Council' },
  { type: 'Bank Speed Money', redFlag: 'Staff asks for cash to "process" a claim faster', reportTo: 'RBI Banking Ombudsman' }
]

const getFraudAlerts = async (req, res) => {
  res.json({
    scams: SCAM_LIBRARY,
    reportLinks: {
      rbi: 'https://cms.rbi.org.in',
      irdai: 'https://igms.irda.gov.in',
      epfo: 'https://epfigms.gov.in'
    }
  })
}

const calculateProtectionScore = async (req, res) => {
  const { bankNomination, licNomination, epfoNomination, dematNomination, hasWill, familyKnowsDocs } = req.body

  const checks = { bankNomination, licNomination, epfoNomination, dematNomination, hasWill, familyKnowsDocs }
  const total = Object.keys(checks).length
  const passed = Object.values(checks).filter(Boolean).length
  const score = Math.round((passed / total) * 100)

  const gaps = Object.entries(checks)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  res.json({ score, gaps, message: score < 60 ? 'Your family has significant gaps to fix.' : 'Good coverage — close the remaining gaps.' })
}

const checkPresumedDeath = async (req, res) => {
  const { yearsMissing } = req.query
  const eligible = Number(yearsMissing) >= 7

  res.json({
    eligible,
    section: 'Section 108, Indian Evidence Act',
    steps: eligible
      ? ['File FIR for the missing person', 'File a court petition for presumed death declaration', 'Obtain the court order', 'Use the court order as a death certificate equivalent for claims']
      : [],
    message: eligible
      ? 'Eligible to file for presumed death declaration.'
      : `Not yet eligible — 7 years missing required, currently at ${yearsMissing || 0}.`
  })
}

module.exports = { getFraudAlerts, calculateProtectionScore, checkPresumedDeath }