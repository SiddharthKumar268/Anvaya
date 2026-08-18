// server/controllers/guideController.js

const POST_OFFICE_SCHEMES = {
  ppf: { name: 'Public Provident Fund', documents: ['Death Certificate', 'PPF Passbook', 'Nominee ID Proof'], steps: ['Submit nominee claim form (Form G) at the post office', 'Attach documents', 'Amount credited to nominee account'] },
  nsc: { name: 'National Savings Certificate', documents: ['Death Certificate', 'NSC Certificate', 'Nominee ID Proof'], steps: ['Submit NSC discharge form at post office', 'Attach documents', 'Maturity amount paid to nominee'] },
  kvp: { name: 'Kisan Vikas Patra', documents: ['Death Certificate', 'KVP Certificate', 'Nominee ID Proof'], steps: ['Submit KVP encashment form', 'Attach documents', 'Amount paid at issuing post office'] },
  sukanya: { name: 'Sukanya Samriddhi Yojana', documents: ['Death Certificate', 'SSY Passbook', 'Guardian/Nominee ID Proof'], steps: ['Submit closure form citing account holder death', 'Attach documents', 'Balance paid to guardian/nominee'] },
  mis: { name: 'Monthly Income Scheme', documents: ['Death Certificate', 'MIS Passbook', 'Nominee ID Proof'], steps: ['Submit nominee claim form', 'Attach documents', 'Principal + pending interest paid out'] },
  td: { name: 'Time Deposit', documents: ['Death Certificate', 'TD Passbook', 'Nominee ID Proof'], steps: ['Submit premature closure/claim form', 'Attach documents', 'Maturity value paid to nominee'] }
}

const getPostOfficeGuide = async (req, res) => {
  const { scheme } = req.params
  const data = POST_OFFICE_SCHEMES[scheme]

  if (!data) return res.status(400).json({ message: 'Unknown scheme' })
  res.json({ scheme, ...data })
}

const KNOWLEDGE_HUB = {
  legal: {
    topics: ['How to get a Legal Heir Certificate', 'How to get a Succession Certificate', 'Court process overview', "Daughter's rights under Hindu Succession Act 2005"],
    helpline: 'National Legal Services Authority (NALSA): 15100'
  },
  financial: {
    topics: ['Bank claim process for nominees', 'LIC claim process', 'EPFO withdrawal after death', 'ITR filing for a deceased person'],
    helpline: 'RBI Banking Ombudsman: 14448'
  },
  asset: {
    topics: ['Property mutation process (state-wise)', 'Vehicle RC transfer at RTO', 'Demat/shares transmission'],
    helpline: null
  },
  escalation: {
    topics: ['How to file a grievance', 'RBI / IRDAI / EPFO ombudsman process', 'Consumer court as a last resort'],
    helpline: 'National Consumer Helpline: 1915'
  }
}

const getKnowledgeHub = async (req, res) => {
  const { category, state } = req.query

  if (category) {
    const section = KNOWLEDGE_HUB[category]
    if (!section) return res.status(400).json({ message: 'Unknown category' })
    return res.json({ category, state: state || 'all', ...section })
  }

  res.json(KNOWLEDGE_HUB)
}

const DEATH_CERTIFICATE_GUIDE = {
  issuedBy: 'Municipal Corporation (urban) or Gram Panchayat (rural)',
  documents: ['Hospital death report / doctor certificate', 'ID proof of the deceased', 'Applicant ID proof'],
  timeline: '7-21 days typically; longer if delayed registration',
  ifDelayed: 'Deaths registered after 1 year require a court order or District Magistrate approval'
}

const SUCCESSION_CERTIFICATE_GUIDE = {
  neededWhen: 'No nominee named on the asset',
  issuedBy: 'Civil Court',
  cost: 'Court fee + lawyer fee, varies by state and asset value',
  timeline: '6 months to 2 years'
}

const PREVENTIVE_CHECKLIST = [
  'Add a nominee to every bank account, LIC policy, EPF/PPF, and demat account',
  'Write a basic will — self-written (holograph) is legally valid, registered is stronger evidence',
  "Tell your family where documents (policies, passbooks, will) are kept",
  'Review nominations after major life events — marriage, children, property purchase'
]

const getDeathSuccessionGuide = async (req, res) => {
  const { tab } = req.query // 'reactive' | 'preventive'

  if (tab === 'preventive') {
    return res.json({ tab: 'preventive', checklist: PREVENTIVE_CHECKLIST })
  }

  res.json({
    tab: 'reactive',
    deathCertificate: DEATH_CERTIFICATE_GUIDE,
    successionCertificate: SUCCESSION_CERTIFICATE_GUIDE
  })
}

module.exports = { getPostOfficeGuide, getKnowledgeHub, getDeathSuccessionGuide }