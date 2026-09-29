// server/data/knowledgeBase.js
// Consolidated knowledge base for RAG — all domain documents as searchable text chunks

const knowledgeChunks = [

  // ===== DOCUMENT CHECKLISTS =====
  {
    id: 'checklist-bank-account',
    category: 'documents',
    title: 'Bank Account Claim Documents',
    text: 'To claim a deceased person\'s bank account, the nominee needs: Death Certificate, Nominee or Legal Heir ID Proof (Aadhaar/PAN), Passbook or Account Statement, Nominee Claim Form (bank-specific), and Cancelled Cheque of Nominee Account. If there is no nominee registered, a Succession Certificate or Legal Heir Certificate will also be required.'
  },
  {
    id: 'checklist-fixed-deposit',
    category: 'documents',
    title: 'Fixed Deposit Claim Documents',
    text: 'To claim a Fixed Deposit (FD) after the account holder\'s death: Death Certificate, FD Receipt or Certificate, Nominee ID Proof, and Nominee Claim Form. Note: Auto-renewing FDs should be broken immediately post-demise. Premature withdrawal penalties are waived in the event of the account holder\'s death.'
  },
  {
    id: 'checklist-life-insurance',
    category: 'documents',
    title: 'Life Insurance (LIC) Claim Documents',
    text: 'To claim Life Insurance after death: Death Certificate, Original Policy Document, Nominee ID Proof, Claim Form (Form A for maturity / Form B for death claim), NEFT Mandate Form, and Medical/Hospital Records if applicable. Claims should ideally be filed within 90 days, though late claims are accepted with valid reasons.'
  },
  {
    id: 'checklist-epf',
    category: 'documents',
    title: 'EPF (Employee Provident Fund) Claim Documents',
    text: 'To withdraw EPF after the employee\'s death: Death Certificate, EPF Nominee Claim Form (Form 20 for PF withdrawal, Form 10D for pension), Nominee ID Proof, Bank Passbook of Nominee. If there is no nomination on record, a Succession Certificate is also required. Claims are filed through the EPFO regional office or via the employer.'
  },
  {
    id: 'checklist-pension',
    category: 'documents',
    title: 'Pension Claim Documents',
    text: 'To claim family pension after death: Death Certificate, Pension Payment Order (PPO), Family Pension Claim Form, Nominee ID Proof, and Joint Bank Account Details. Family pension is available to the spouse, and in their absence, to dependent children.'
  },
  {
    id: 'checklist-mutual-fund',
    category: 'documents',
    title: 'Mutual Fund Transmission Documents',
    text: 'To transfer mutual fund units after death: Death Certificate, Folio Statement, Nominee ID Proof, Transmission Request Form, and KYC of Nominee. The process is called "transmission" not "transfer". Contact the AMC (Asset Management Company) or registrar (CAMS/KFintech) directly.'
  },
  {
    id: 'checklist-demat',
    category: 'documents',
    title: 'Demat Account / Shares Transmission Documents',
    text: 'To transmit shares and demat account holdings after death: Death Certificate, Demat Account Statement, Nominee ID Proof, Transmission Request Form, and KYC of Nominee. Contact the Depository Participant (DP) — either CDSL or NSDL — to initiate the transmission process.'
  },
  {
    id: 'checklist-property',
    category: 'documents',
    title: 'Property Mutation Documents',
    text: 'To transfer property after death (mutation): Death Certificate, Property Title Deed, Legal Heir Certificate or Succession Certificate, Mutation Application Form, and No Objection Certificate (NOC) from other legal heirs if applicable. Property mutation is a state-level process and procedures vary by state. For agricultural land, contact the Tehsildar office; for urban property, contact the municipal corporation.'
  },
  {
    id: 'checklist-vehicle',
    category: 'documents',
    title: 'Vehicle RC Transfer Documents',
    text: 'To transfer vehicle Registration Certificate (RC) after death: Death Certificate, Registration Certificate (RC), Legal Heir Certificate, RTO Transfer Form (Form 31), and Insurance Transfer Request. Visit the Regional Transport Office (RTO) where the vehicle is registered.'
  },
  {
    id: 'checklist-post-office',
    category: 'documents',
    title: 'Post Office Scheme Claim Documents',
    text: 'To claim Post Office scheme deposits after death: Death Certificate, Passbook or Certificate of the Scheme, Nominee ID Proof, and Nominee Claim Form (post office specific). Post office schemes include PPF, NSC, KVP, Sukanya Samriddhi, MIS, and Time Deposits.'
  },

  // ===== POST OFFICE SCHEMES =====
  {
    id: 'scheme-ppf',
    category: 'post-office',
    title: 'PPF (Public Provident Fund) Claim Process',
    text: 'Public Provident Fund (PPF) claim after death: Required documents are Death Certificate, PPF Passbook, and Nominee ID Proof. Steps: 1) Submit nominee claim form (Form G) at the post office, 2) Attach all required documents, 3) Amount is credited to the nominee\'s bank account. The entire accumulated balance including interest is payable to the nominee.'
  },
  {
    id: 'scheme-nsc',
    category: 'post-office',
    title: 'NSC (National Savings Certificate) Claim Process',
    text: 'National Savings Certificate (NSC) claim after death: Required documents are Death Certificate, NSC Certificate, and Nominee ID Proof. Steps: 1) Submit NSC discharge form at the post office, 2) Attach documents, 3) Maturity amount paid to nominee. NSC has a fixed maturity period of 5 years.'
  },
  {
    id: 'scheme-kvp',
    category: 'post-office',
    title: 'KVP (Kisan Vikas Patra) Claim Process',
    text: 'Kisan Vikas Patra (KVP) claim after death: Required documents are Death Certificate, KVP Certificate, and Nominee ID Proof. Steps: 1) Submit KVP encashment form, 2) Attach documents, 3) Amount paid at the issuing post office. KVP doubles the invested amount over a fixed period.'
  },
  {
    id: 'scheme-sukanya',
    category: 'post-office',
    title: 'Sukanya Samriddhi Yojana Claim Process',
    text: 'Sukanya Samriddhi Yojana (SSY) claim after account holder death: Required documents are Death Certificate, SSY Passbook, and Guardian/Nominee ID Proof. Steps: 1) Submit closure form citing account holder death, 2) Attach documents, 3) Balance paid to guardian or nominee. This scheme is specifically for the girl child.'
  },
  {
    id: 'scheme-mis',
    category: 'post-office',
    title: 'MIS (Monthly Income Scheme) Claim Process',
    text: 'Post Office Monthly Income Scheme (MIS) claim after death: Required documents are Death Certificate, MIS Passbook, and Nominee ID Proof. Steps: 1) Submit nominee claim form, 2) Attach documents, 3) Principal plus pending interest paid out to nominee.'
  },
  {
    id: 'scheme-td',
    category: 'post-office',
    title: 'Time Deposit Claim Process',
    text: 'Post Office Time Deposit (TD) claim after death: Required documents are Death Certificate, TD Passbook, and Nominee ID Proof. Steps: 1) Submit premature closure/claim form, 2) Attach documents, 3) Maturity value paid to nominee.'
  },

  // ===== GOVERNMENT SCHEMES =====
  {
    id: 'scheme-pmjjby',
    category: 'insurance',
    title: 'PMJJBY (Pradhan Mantri Jeevan Jyoti Bima Yojana) Claim',
    text: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY) is a government-backed life insurance scheme with a cover of ₹2,00,000 and annual premium of just ₹436. Eligibility: Age 18-50 at enrollment, bank or post office savings account, auto-debit consent. Required claim documents: Death Certificate, Claim Form (available at enrolling bank/post office), Nominee ID Proof, Original Certificate of Insurance (if issued). Claim process: 1) Nominee submits claim form and documents to the bank or post office where the policy was enrolled, 2) Bank forwards claim to the insurance company (LIC or empanelled insurer), 3) Claim amount credited to nominee bank account, typically within 30 days. There is no fixed deadline, but claim promptly as delays complicate verification. Many people forget about this scheme since the premium is auto-debited — check the deceased\'s bank statements for ₹436 annual debit.'
  },
  {
    id: 'scheme-pmsby',
    category: 'insurance',
    title: 'PMSBY (Pradhan Mantri Suraksha Bima Yojana) Claim',
    text: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY) is a government-backed accidental death and disability insurance scheme with a cover of ₹2,00,000 and annual premium of just ₹20. Eligibility: Age 18-70 at enrollment, bank or post office savings account, auto-debit consent. Required claim documents: Death Certificate, FIR or Post-mortem report (for accidental death), Claim Form, Nominee ID Proof. Claim process: 1) Nominee submits claim form and documents to the enrolling bank or post office, 2) Bank verifies and forwards to insurer, 3) Claim settled after verification of accidental cause of death. This scheme covers ONLY accidental death — natural death is not covered. Report the incident to the bank promptly. Check bank statements for ₹20 annual debit.'
  },
  {
    id: 'scheme-eps',
    category: 'pension',
    title: 'EPS (Employee Pension Scheme) Family Pension',
    text: 'Employee Pension Scheme (EPS-95) provides family pension after the employee\'s death. Eligibility: Employee with EPF contributions and at least 6 months of service. Required documents: Death Certificate, Form 10D (Family Pension Claim), Nominee/Family ID Proof, Bank Account Details of Claimant, Succession Certificate (if no nomination on record). Claim process: 1) Family member submits Form 10D to the EPFO regional office or via employer, 2) EPFO verifies service and contribution records, 3) Monthly family pension begins after approval. The pension amount depends on the deceased\'s service period and last drawn salary.'
  },
  {
    id: 'scheme-nps',
    category: 'pension',
    title: 'NPS (National Pension System) Withdrawal',
    text: 'National Pension System (NPS) withdrawal after subscriber death: Eligibility requires an active NPS account (Tier I). Required documents: Death Certificate, Withdrawal Form (Form 303 or applicable annexure), Nominee ID Proof, Bank Account Details of Nominee, PRAN Card/Number. Claim process: 1) Nominee submits withdrawal request through the associated Point of Presence (POP) or online via CRA, 2) PFRDA/CRA verifies documents, 3) Corpus paid out as lump sum or annuity as per nominee choice. The entire corpus is payable to the nominee.'
  },

  // ===== LEGAL PROCESSES =====
  {
    id: 'legal-death-certificate',
    category: 'legal',
    title: 'How to Obtain a Death Certificate',
    text: 'Death Certificate is issued by: Municipal Corporation (urban areas) or Gram Panchayat (rural areas). Required documents: Hospital death report or doctor certificate, ID proof of the deceased, and Applicant ID proof. Timeline: 7-21 days typically; longer if delayed registration. Important: Deaths registered after 1 year require a court order or District Magistrate approval. You should obtain at least 10-15 copies as almost every institution will require an original. The Death Certificate is the single most important document — without it, no financial claim can proceed.'
  },
  {
    id: 'legal-succession-certificate',
    category: 'legal',
    title: 'Succession Certificate — When and How',
    text: 'Succession Certificate is needed when: No nominee is named on the asset. Issued by: Civil Court. Cost: Court fee plus lawyer fee, varies by state and asset value. Timeline: 6 months to 2 years. A Succession Certificate gives the holder legal authority to inherit the deceased\'s debts and securities. It is different from a Legal Heir Certificate — a Legal Heir Certificate is issued by the Tehsildar and is simpler but only valid for movable assets and government purposes. For immovable property or disputed estates, a Succession Certificate from the court is required.'
  },
  {
    id: 'legal-heir-vs-succession',
    category: 'legal',
    title: 'Legal Heir Certificate vs Succession Certificate',
    text: 'Legal Heir Certificate: Issued by the local Tehsildar or Revenue Department. Simpler process, lower cost. Used for movable assets, government claims, and insurance. Sufficient for most bank accounts, EPF, and insurance claims. Succession Certificate: Issued by the Civil Court. More complex, requires a lawyer. Used for immovable property, disputed assets, and complex estates. Required when there is no will and assets are contested. Choose the Legal Heir Certificate first if assets are straightforward. Escalate to Succession Certificate only if needed for property or disputed cases.'
  },
  {
    id: 'legal-no-will',
    category: 'legal',
    title: 'What Happens When There Is No Will (Intestate)',
    text: 'If the deceased died without a will (intestate succession), the assets are distributed according to the applicable personal law. Under the Hindu Succession Act 2005: Class I heirs (wife, sons, daughters, mother) get equal shares. Daughters have equal rights as sons, including in ancestral and self-acquired property. Under Muslim Personal Law: Fixed shares for specific relatives. Under Indian Succession Act (Christians and Parsis): Spouse gets one-third, rest divided among children. In all cases, you will need either a Legal Heir Certificate or Succession Certificate to claim assets. Having a will would have simplified this process enormously.'
  },

  // ===== KNOWLEDGE HUB TOPICS =====
  {
    id: 'hub-bank-claim',
    category: 'financial',
    title: 'Bank Claim Process for Nominees',
    text: 'Bank claim process for nominees after account holder death: 1) Visit the bank branch with the Death Certificate, 2) Submit the nominee claim form (varies by bank), 3) Provide your ID proof and a cancelled cheque, 4) Bank verifies documents, 5) Amount transferred to nominee account within 15-30 days. If there is no nominee, the process requires a Succession Certificate and takes longer. Joint accounts with "Either or Survivor" clause transfer automatically to the surviving holder.'
  },
  {
    id: 'hub-lic-claim',
    category: 'insurance',
    title: 'LIC Claim Process After Death',
    text: 'LIC (Life Insurance Corporation) claim process after policyholder death: 1) Notify the branch or call 1800-258-4477, 2) Get claim forms (available online or at branch), 3) Submit: Death Certificate, original policy bond, nominee ID, claim form, NEFT mandate, 4) For early death claims (within 3 years of policy), additional investigation may be done, 5) Settlement typically within 30 days of complete documents. Claim can be filed at any LIC branch, not just the servicing branch.'
  },
  {
    id: 'hub-epfo-withdrawal',
    category: 'financial',
    title: 'EPFO Withdrawal After Death',
    text: 'EPFO withdrawal process after employee death: The nominee can claim PF balance (Form 20), pension (Form 10D), and EDLI insurance (Form 51F). Steps: 1) Obtain UAN and service details from the employer, 2) Submit composite claim form to EPFO regional office or online, 3) Attach Death Certificate, nominee ID, bank details, 4) EPFO processes within 20-30 days. The EDLI (Employees Deposit Linked Insurance) provides up to ₹7 lakh insurance — many families are unaware of this benefit.'
  },
  {
    id: 'hub-itr-deceased',
    category: 'financial',
    title: 'ITR Filing for a Deceased Person',
    text: 'Income Tax Return filing for deceased: The legal heir must file the deceased\'s ITR for the year of death. Steps: 1) Register as legal representative on the Income Tax portal, 2) File ITR for income earned from April 1 to date of death, 3) Claim any tax refunds due. Any tax refund will be credited to the legal heir. This is a legal obligation and helps prevent future tax notices on the deceased\'s PAN.'
  },

  // ===== ASSET TRANSFER =====
  {
    id: 'asset-property-mutation',
    category: 'asset',
    title: 'Property Mutation Process',
    text: 'Property mutation after death is a state-level process. For urban property: Apply at the municipal corporation with Death Certificate, property documents, legal heir certificate, and mutation form. For agricultural land: Apply at the Tehsildar office. Timeline varies by state — typically 1-6 months. Stamp duty may be applicable. In some states, mutation in favor of legal heirs is exempt from stamp duty. Important: Mutation is not the same as property registration. Mutation updates the revenue records; registration transfers legal ownership.'
  },
  {
    id: 'asset-vehicle-transfer',
    category: 'asset',
    title: 'Vehicle RC Transfer at RTO',
    text: 'Vehicle RC transfer after death: Visit the RTO where the vehicle is registered with Form 31 (transfer application), Death Certificate, RC book, Legal Heir Certificate, insurance transfer request, and emission test certificate. The transfer fee is nominal. Insurance must also be transferred — contact the insurance company separately. If the vehicle has a loan, the loan must be settled or transferred before RC transfer.'
  },
  {
    id: 'asset-demat-transmission',
    category: 'asset',
    title: 'Demat/Shares Transmission Process',
    text: 'Shares and demat account transmission after death: Contact your Depository Participant (DP) with the transmission request form, Death Certificate, nominee ID proof, and KYC documents. For CDSL accounts: Use the "Transmission Request Form" available on the DP website. For NSDL accounts: Similar process through the DP. Timeline: 15-30 days. If there is no nominee, an affidavit, surety bond, and indemnity may be required in addition to the Succession Certificate.'
  },

  // ===== SAFETY & FRAUD =====
  {
    id: 'safety-fake-agent',
    category: 'safety',
    title: 'Scam Alert: Fake Recovery Agents',
    text: 'Beware of fake agents who claim to "speed up" LIC or PF claims for a fee. Red flags: They approach you unsolicited, promise faster processing for cash, ask for original documents, or want power of attorney. Report to: IRDAI (for insurance fraud) or EPFO Vigilance (for PF fraud). Remember: No legitimate claim requires a middleman. You can file all claims directly at the respective institution or online.'
  },
  {
    id: 'safety-overcharging-lawyer',
    category: 'safety',
    title: 'Scam Alert: Overcharging Lawyers',
    text: 'Beware of lawyers who quote inflated fees for a simple Legal Heir or Succession Certificate. Red flags: Quoting fees as a percentage of asset value, refusing to give written estimates, pressuring for urgent payment. Report to: State Bar Council. Typical Legal Heir Certificate cost: ₹500-2000 in government fees. Typical Succession Certificate cost: Court fee (varies by state and asset value) plus reasonable lawyer fees of ₹5,000-25,000.'
  },
  {
    id: 'safety-bank-speed-money',
    category: 'safety',
    title: 'Scam Alert: Bank Staff Demanding Speed Money',
    text: 'Beware of bank staff asking for cash to "process" a nominee claim faster. This is bribery and illegal. Report to: RBI Banking Ombudsman at https://cms.rbi.org.in or call 14448. All bank claims have standard processing timelines defined by RBI. If a bank delays unreasonably, file a complaint with the Banking Ombudsman.'
  },
  {
    id: 'safety-report-links',
    category: 'safety',
    title: 'Where to Report Financial Fraud',
    text: 'Report financial fraud and grievances: RBI Banking Ombudsman — https://cms.rbi.org.in or call 14448 (for bank-related issues). IRDAI Insurance Ombudsman — https://igms.irda.gov.in or call 155255 (for insurance issues). EPFO Grievance Portal — https://epfigms.gov.in (for EPF/pension issues). National Consumer Helpline — 1800-114-000 or 1915 (for general consumer complaints). Always file complaints online first to get a tracking number.'
  },

  // ===== UDGAM & UNCLAIMED DEPOSITS =====
  {
    id: 'udgam-overview',
    category: 'financial',
    title: 'UDGAM — Unclaimed Deposit Search',
    text: 'UDGAM (Unclaimed Deposits — Gateway to Access inforMation) is an RBI portal to search for unclaimed bank deposits across multiple banks. Bank accounts inactive for 10+ years are transferred to the RBI\'s DEAF (Depositor Education and Awareness Fund). How to search: Visit the UDGAM portal, enter the deceased\'s name, PAN, or account details. If unclaimed deposits are found, you can file a reclamation claim through the respective bank. This is crucial because many families are unaware of dormant accounts that may contain significant amounts.'
  },

  // ===== PRESUMED DEATH =====
  {
    id: 'legal-presumed-death',
    category: 'legal',
    title: 'Missing Person — Presumed Death Declaration',
    text: 'Under Section 108 of the Indian Evidence Act, if a person has been missing for 7 or more years, they can be legally presumed dead. Steps: 1) File an FIR for the missing person, 2) File a court petition for presumed death declaration, 3) Obtain the court order, 4) Use the court order as a death certificate equivalent for claims. This process enables families to claim assets of missing persons. The court order serves as a legal equivalent of a death certificate for financial claims.'
  },

  // ===== LOCKER & FD TRAPS =====
  {
    id: 'safety-locker-seizure',
    category: 'safety',
    title: 'Bank Locker Seizure Prevention',
    text: 'RBI guidelines on bank locker access after death: If you are a registered nominee or joint holder with "survivor" clause, you can access the locker relatively quickly — submit Death Certificate and ID proof. If not a nominee, a Succession Certificate is required. Critical: Inactive lockers (not operated for 3+ years) may be broken open by the bank per RBI circular. Act quickly to access the locker contents. Get the exact forms from the bank branch. Inventory will be done in presence of bank officials and nominee.'
  },
  {
    id: 'safety-fd-auto-renewal',
    category: 'financial',
    title: 'FD Auto-Renewal Trap After Death',
    text: 'Fixed Deposits with auto-renewal continue renewing even after the account holder\'s death, potentially locking funds at unfavorable rates. Important: Break auto-renewing FDs immediately post-demise. Premature withdrawal penalties are waived in the event of the account holder\'s death — this is per RBI guidelines. Submit Death Certificate and nominee claim form at the bank to stop auto-renewal and withdraw the funds.'
  },

  // ===== PREVENTIVE CHECKLIST =====
  {
    id: 'preventive-checklist',
    category: 'preventive',
    title: 'Preventive Steps — What Every Family Should Do Now',
    text: 'Preventive checklist to protect your family financially: 1) Add a nominee to every bank account, LIC policy, EPF/PPF, and demat account. 2) Write a basic will — a self-written (holograph) will is legally valid, but a registered will is stronger evidence. 3) Tell your family where documents (policies, passbooks, will) are kept. 4) Review nominations after major life events — marriage, children, property purchase. These four steps can save your family months of struggle and lakhs in legal fees.'
  },

  // ===== FAQs =====
  {
    id: 'faq-first-step',
    category: 'faq',
    title: 'What to do first after losing a family member',
    text: 'The first thing to do after losing a family member is to obtain the Death Certificate as early as possible. Most institutions will require at least 5-10 copies to begin any claims process. Apply at the Municipal Corporation (urban) or Gram Panchayat (rural) within 21 days of death to avoid complications. Delayed registration beyond 1 year requires court order or District Magistrate approval.'
  },
  {
    id: 'faq-insurance-deadline',
    category: 'faq',
    title: 'Insurance claim filing deadline',
    text: 'Most insurance companies prefer claims to be filed within 30-90 days, but delays are accepted if valid reasons are provided. It is best to notify the insurance company early even if all documents are not ready. For LIC, claims can be filed up to 3 years. For PMJJBY and PMSBY, there is no fixed deadline but prompt filing is recommended as delays complicate verification.'
  },
  {
    id: 'faq-no-will',
    category: 'faq',
    title: 'What happens if the deceased had no will',
    text: 'If there is no will (intestate succession), the assets are distributed according to the applicable succession laws. For Hindus: Hindu Succession Act applies — wife, sons, daughters, and mother are Class I heirs with equal rights. For Muslims: Sharia law applies with fixed shares. For Christians and Parsis: Indian Succession Act applies. A Succession Certificate or Legal Heir Certificate will be required to claim assets from institutions.'
  },
  {
    id: 'faq-find-bank-accounts',
    category: 'faq',
    title: 'How to find all bank accounts of the deceased',
    text: 'To find all bank accounts of the deceased: 1) Use the RBI UDGAM portal to search across multiple banks for unclaimed deposits, 2) Check their emails and SMS for banking notifications, 3) Look for passbooks, cheque books, and bank statements at home, 4) Check tax returns — Form 26AS shows TDS deducted by banks on interest income, revealing account details, 5) Check CIBIL/credit report which lists all loan accounts.'
  },
  {
    id: 'faq-bank-locker',
    category: 'faq',
    title: 'Can I access the bank locker immediately',
    text: 'Bank locker access after death: If you are a registered nominee or joint holder with "survivor" clause, you can access it relatively fast — submit Death Certificate and your ID proof at the bank branch. Otherwise, it requires a Succession Certificate and bank inventory process which can take several months. Act quickly to prevent the bank from classifying the locker as "inactive" which could lead to a break-open procedure.'
  },
  {
    id: 'faq-epf-withdrawal',
    category: 'faq',
    title: 'EPF withdrawal process for nominees',
    text: 'EPF withdrawal process for nominees: File Form 20 (for PF balance withdrawal) and Form 10D (for family pension) through the EPFO portal or through the employer. Required documents: Death Certificate, nominee ID, bank details. The process usually takes 20-30 days after document submission. Don\'t forget the EDLI (Employees Deposit Linked Insurance) claim of up to ₹7 lakh — file Form 51F.'
  },
  {
    id: 'faq-succession-lawyer',
    category: 'faq',
    title: 'Do I need a lawyer for succession certificate',
    text: 'Yes, a Succession Certificate requires filing a petition in the Civil Court, and having a lawyer will help navigate the legal formalities and court hearings. The process involves: 1) Filing a petition, 2) Court issues public notice (45 days), 3) If no objections, court grants the certificate. Cost varies by state — court fee is based on asset value, plus lawyer fees of ₹5,000-25,000 typically. Timeline: 6 months to 2 years.'
  },
  {
    id: 'faq-timeline',
    category: 'faq',
    title: 'How long does the entire process take',
    text: 'Timeline for financial recovery after death: Simple nominated bank accounts take 15-30 days. Insurance claims (LIC, PMJJBY) take 30-60 days. EPF withdrawal takes 20-30 days. Property mutation takes 1-6 months. Complex cases involving courts (Succession Certificate) can take 6 months to 2 years. Starting early and having proper nominations in place significantly reduces the timeline.'
  },

  // ===== HELPLINES =====
  {
    id: 'helplines',
    category: 'support',
    title: 'Important Helpline Numbers',
    text: 'Important helpline numbers for financial claims: EPFO Helpline: 1800-118-005 (toll-free). LIC Helpline: 1800-258-4477 (toll-free). IRDAI (Insurance Regulator): 155255. Consumer Forum: 1800-114-000 (toll-free). National Consumer Helpline: 1915. National Legal Services Authority (NALSA): 15100. RBI Banking Ombudsman: 14448. All toll-free numbers work from landline and mobile.'
  }
]

module.exports = knowledgeChunks
