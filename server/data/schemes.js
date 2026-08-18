// server/data/schemes.js
module.exports = {
  pmjjby: {
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
    type: 'Life Insurance',
    coverAmount: 200000,
    annualPremium: 436,
    eligibility: 'Age 18-50 at enrollment, bank/post office savings account, auto-debit consent',
    claimDocuments: [
      'Death Certificate',
      'Claim Form (available at enrolling bank/post office)',
      'Nominee ID Proof',
      'Original Certificate of Insurance (if issued)'
    ],
    claimWindow: 'No fixed deadline, but claim promptly as delays complicate verification',
    claimProcess: [
      'Nominee submits claim form + documents to the bank/post office where the policy was enrolled',
      'Bank forwards claim to the insurance company (LIC or empanelled insurer)',
      'Claim amount credited to nominee bank account, typically within 30 days'
    ]
  },
  pmsby: {
    name: 'Pradhan Mantri Suraksha Bima Yojana',
    type: 'Accidental Death & Disability Insurance',
    coverAmount: 200000,
    annualPremium: 20,
    eligibility: 'Age 18-70 at enrollment, bank/post office savings account, auto-debit consent',
    claimDocuments: [
      'Death Certificate',
      'FIR / Post-mortem report (for accidental death)',
      'Claim Form',
      'Nominee ID Proof'
    ],
    claimWindow: 'Applicable only for accidental death; report incident to bank promptly',
    claimProcess: [
      'Nominee submits claim form + documents to the enrolling bank/post office',
      'Bank verifies and forwards to insurer',
      'Claim settled after verification of accidental cause of death'
    ]
  },
  eps: {
    name: 'Employees Pension Scheme (EPS-95)',
    type: 'Pension',
    eligibility: 'Employee with EPF contributions and at least 6 months of service',
    claimDocuments: [
      'Death Certificate',
      'Form 10D (Family Pension Claim)',
      'Nominee/Family ID Proof',
      'Bank Account Details of Claimant',
      'Succession Certificate (if no nomination on record)'
    ],
    claimProcess: [
      'Family member submits Form 10D to the EPFO regional office or via employer',
      'EPFO verifies service and contribution records',
      'Monthly family pension begins after approval'
    ]
  },
  nps: {
    name: 'National Pension System',
    type: 'Pension',
    eligibility: 'Subscriber with an active NPS account (Tier I)',
    claimDocuments: [
      'Death Certificate',
      'Withdrawal Form (Form 303 or applicable annexure)',
      'Nominee ID Proof',
      'Bank Account Details of Nominee',
      'PRAN Card/Number'
    ],
    claimProcess: [
      'Nominee submits withdrawal request through the associated Point of Presence (POP) or online via CRA',
      'PFRDA/CRA verifies documents',
      'Corpus paid out as lump sum or annuity as per nominee choice'
    ]
  }
}