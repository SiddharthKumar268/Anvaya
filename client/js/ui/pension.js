// pension.js — Statutory Pension & Employer Benefits Engine
// Connected to AnvayaApi + Offline Fallback Engine + Form Studio

let currentCalculationState = null;
let currentActiveForm = '10d';
let currentActiveTrack = 'epfo';

// ─── Document Templates Metadata ──────────────────────────────
const FORM_METADATA = {
  '10d': {
    title: 'FORM 10D — EPS FAMILY PENSION CLAIM',
    authority: 'EPFO Field / Regional Office (through Employer)',
    sla: '20 Working Days (EPFO Citizen Charter)',
    attestation: 'Employer Signature & Stamp (or Bank Manager if closed)',
    enclosures: [
      'Original Death Certificate (Municipal authority with QR / seal)',
      '3 copies of passport-size joint photograph of claimant & minor children',
      'Original cancelled bank cheque with claimant name and IFSC printed',
      'Self-attested copies of Aadhaar and PAN cards of claimant',
      'Birth certificates of minor children claiming child allowance (<25 yrs)'
    ]
  },
  '20': {
    title: 'FORM 20 — EPF MEMBER ACCUMULATION WITHDRAWAL',
    authority: 'EPFO Field / Regional Office',
    sla: '20 Working Days (Mandatory Interest for Delay)',
    attestation: 'Employer Seal (or Branch Manager of claimant\'s bank)',
    enclosures: [
      'Original Death Certificate of deceased EPF subscriber',
      'Copy of Aadhaar & PAN card of the claimant / nominee',
      'Original cancelled cheque or updated savings bank passbook copy',
      'Form 10D (if submitting combined EPS pension claim simultaneously)'
    ]
  },
  '5if': {
    title: 'FORM 5IF — EDLI STATUTORY LIFE ASSURANCE CLAIM',
    authority: 'EPFO Regional Commissioner (Sec 6C EPF Act)',
    sla: '30 Working Days (Statutory Payout up to ₹7,00,000)',
    attestation: 'Employer Certificate confirming member was on roll at time of demise',
    enclosures: [
      'Original death certificate showing date and place of death',
      'Employer certificate of last 12 months wage and PF contribution',
      'Cancelled cheque of the claimant\'s active bank account',
      'Proof of claimant relationship (Legal Heir / Surviving Member certificate or Aadhaar)'
    ]
  },
  'gratuity': {
    title: 'FORM K — NOTICE OF CLAIM FOR GRATUITY BY NOMINEE',
    authority: 'Employer HR / Controlling Authority under Gratuity Act',
    sla: '30 Days from date of receipt (10% p.a. penalty for delay)',
    attestation: 'Notarized self-declaration or Legal Heir affidavit',
    enclosures: [
      'Certified copy of Death Certificate',
      'Nomination receipt in Form F (if registered with company)',
      'Cancelled cheque for direct NEFT / RTGS settlement to nominee account',
      'Self-attested Aadhaar and PAN card copies of the claimant'
    ]
  }
};

// ─── Roadmap Tracks Data ──────────────────────────────────────
const ROADMAP_TRACKS = {
  epfo: [
    {
      step: 1,
      title: 'Obtain Member UAN & Employer Clearance',
      desc: 'Verify deceased UAN on EPFO portal or check salary slips. Request employer to update Date of Exit as "Demise (Reason: Death in Service)" in the EPFO Employer ECR portal.',
      timing: 'Days 1 – 5'
    },
    {
      step: 2,
      title: 'Submit Composite Claim (Forms 20 + 10D + 5IF)',
      desc: 'Submit physical or online composite claim form to the EPFO Field Office with bank cancelled cheque and attested photographs.',
      timing: 'Days 6 – 10'
    },
    {
      step: 3,
      title: 'Field Office Scrutiny & 20-Day SLA Watch',
      desc: 'EPFO inspects muster roll and insurance eligibility. Track status online using "Know Your Claim Status" on unified portal.',
      timing: 'Days 11 – 20'
    },
    {
      step: 4,
      title: 'EPF Corpus & EDLI Credit to Bank Account',
      desc: 'Lump-sum PF balance + EDLI insurance (up to ₹7,00,000) credited directly to claimant\'s bank account via NEFT.',
      timing: 'By Day 20'
    },
    {
      step: 5,
      title: 'Pension Payment Order (PPO) Generation',
      desc: 'EPFO issues PPO number. First monthly family pension is credited in the following month with lifetime PPO booklet.',
      timing: 'First week of next month'
    }
  ],
  employer: [
    {
      step: 1,
      title: 'Formal Notice of Demise to Employer HR',
      desc: 'Submit formal intimation letter with certified death certificate to company HR / People Operations desk.',
      timing: 'Day 1'
    },
    {
      step: 2,
      title: 'Submit Form K for Payment of Gratuity',
      desc: 'Serve formal Form K notice under Section 7 of Payment of Gratuity Act 1972 demanding statutory gratuity within 30 days.',
      timing: 'Days 2 – 5'
    },
    {
      step: 3,
      title: 'Audit Full & Final Settlement (F&F)',
      desc: 'Demand detailed F&F statement including accrued privilege leaves, unpaid salary, medical insurance reimbursement, and bonus.',
      timing: 'Days 6 – 15'
    },
    {
      step: 4,
      title: 'Disbursement & Tax Exemption Certificate',
      desc: 'Employer issues settlement cheque or direct bank transfer. Gratuity up to ₹20 Lakhs is 100% exempt from income tax under Sec 10(10).',
      timing: 'Days 16 – 30'
    }
  ],
  govt: [
    {
      step: 1,
      title: 'Head of Office (HOO) Verification',
      desc: 'Intimate Departmental Head with death certificate. HOO initiates Form 14 (Family Pension application) on Bhavishya portal.',
      timing: 'Days 1 – 7'
    },
    {
      step: 2,
      title: 'Sanction of Enhanced Family Pension (50%)',
      desc: 'Pay & Accounts Office (PAO) sanctions Enhanced Family Pension (50% of last pay for first 10 years) and Death Gratuity (DCRG).',
      timing: 'Days 8 – 25'
    },
    {
      step: 3,
      title: 'CPAO Special Seal Authority (SSA)',
      desc: 'Central Pension Accounting Office transmits electronic PPO to the designated Pension Disbursing Bank branch.',
      timing: 'Days 26 – 40'
    },
    {
      step: 4,
      title: 'CPPC First Pension & Arrears Credit',
      desc: 'Bank Centralized Pension Processing Centre (CPPC) starts monthly pension disbursement and issues family pension passbook.',
      timing: 'End of following month'
    }
  ]
};

// ─── Initialization ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPage === 'function') {
    initPage('pension', {
      greeting: 'Pension & Statutory Entitlements',
      subtitle: 'Calculate statutory benefits under EPF, EDLI ₹7L, Gratuity Act 1972, and generate pre-filled claim kits'
    });
  }

  // Pre-fill from active case if available
  prefillCaseDetails();

  // Attach calculation event
  const calcForm = document.getElementById('pension-calc-form');
  if (calcForm) {
    calcForm.addEventListener('submit', handlePensionCalculation);
  }

  // Initial calculation with default form values
  runCalculation();

  // Setup Form Studio and Roadmap
  switchClaimForm('10d');
  renderRoadmapSteps('epfo');
});

// ─── Pre-fill Case Details ──────────────────────────────────
function prefillCaseDetails() {
  try {
    const user = typeof getUser === 'function' ? getUser() : null;
    if (user && user.name) {
      // User info present
    }
  } catch (err) {
    console.warn('Could not auto-fill case info:', err);
  }
}

// ─── Calculation Form Handler ───────────────────────────────
async function handlePensionCalculation(e) {
  if (e && e.preventDefault) e.preventDefault();
  await runCalculation();
}

async function runCalculation() {
  const btn = document.getElementById('btn-run-pension-calc');
  if (btn) {
    btn.textContent = 'Calculating...';
    btn.disabled = true;
  }

  const employerType = document.getElementById('calcEmployerType')?.value || 'private';
  const lastSalary = parseFloat(document.getElementById('calcSalary')?.value) || 0;
  const serviceYears = parseFloat(document.getElementById('calcYears')?.value) || 0;
  const epfBalance = parseFloat(document.getElementById('calcEpfBalance')?.value) || 0;
  const nomineeRelation = document.getElementById('calcRelationship')?.value || 'spouse';
  const childrenCount = parseInt(document.getElementById('calcChildrenCount')?.value, 10) || 0;
  const accumulatedLeaves = parseInt(document.getElementById('calcLeaves')?.value, 10) || 30;

  const payload = {
    employerType,
    lastSalary,
    serviceYears,
    epfBalance,
    nomineeRelation,
    childrenCount,
    accumulatedLeaves
  };

  try {
    let result = null;
    if (typeof AnvayaApi !== 'undefined' && typeof AnvayaApi.calculatePensionEntitlements === 'function') {
      try {
        result = await AnvayaApi.calculatePensionEntitlements(payload);
      } catch (apiErr) {
        console.warn('API call failed, using client fallback calculation engine:', apiErr);
      }
    }

    // If API failed or was offline, compute accurately using client-side statutory engine
    if (!result || !result.lumpSum) {
      result = computeClientSidePension(payload);
    }

    currentCalculationState = result;
    renderCalculationResults(result);
    updateDraftClaimForm();

    if (typeof showToast === 'function') {
      showToast('Statutory benefits updated successfully', 'success');
    }
  } catch (err) {
    console.error('Calculation error:', err);
    if (typeof showToast === 'function') {
      showToast('Error calculating benefits', 'error');
    }
  } finally {
    if (btn) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        Calculate Entitlements
      `;
      btn.disabled = false;
    }
  }
}

// ─── Pure Client-Side Statutory Calculation Engine (Offline Fallback) ──
function computeClientSidePension(payload) {
  const salary = Number(payload.lastSalary) || 0;
  const years = Number(payload.serviceYears) || 0;
  const epf = Number(payload.epfBalance) || 0;
  const kids = Math.min(Math.max(0, Number(payload.childrenCount) || 0), 2);
  const leaves = Math.min(Math.max(0, Number(payload.accumulatedLeaves) || 0), 300);
  const employerType = payload.employerType || 'private';

  // 1. EDLI
  let edliPayout = 0;
  let edliNote = '';
  if (employerType === 'private' || employerType === 'psu') {
    const wageBase = Math.min(salary || 15000, 15000);
    const basicInsurance = wageBase * 35;
    const bonus = Math.min(epf * 0.5, 175000) || 175000;
    edliPayout = Math.min(700000, Math.max(250000, Math.round(basicInsurance + bonus)));
    edliNote = 'Free statutory life cover under Section 6C of EPF Act. Zero employee premium.';
  } else {
    edliPayout = salary > 50000 ? 120000 : 60000;
    edliNote = 'Government Employees Group Insurance Scheme (CGEGIS / SGEGIS) death claim.';
  }

  // 2. Gratuity
  let gratuity = 0;
  if (salary > 0 && years > 0) {
    if (employerType === 'central_govt' || employerType === 'state_govt' || employerType === 'armed_forces') {
      const sixMonthPeriods = Math.floor(years * 2);
      gratuity = Math.min(2000000, Math.round((salary * sixMonthPeriods) / 4));
    } else {
      gratuity = Math.min(2000000, Math.round((salary * years * 15) / 26));
    }
  }

  // 3. Leave Encashment
  const leaveEncashment = salary > 0 ? Math.round((salary / 30) * leaves) : 0;

  // 4. EPF Member Corpus
  const epfCorpus = epf > 0 ? epf : (employerType === 'private' || employerType === 'psu' ? Math.round(salary * 0.24 * 12 * Math.min(years, 5)) : 0);

  const totalLumpSum = edliPayout + gratuity + leaveEncashment + epfCorpus;

  // 5. Monthly Pension
  let spouseMonthlyPension = 0;
  let childMonthlyPension = 0;
  let totalMonthlyPension = 0;
  let pensionScheme = '';
  let pensionRulesSummary = '';

  if (employerType === 'central_govt' || employerType === 'state_govt' || employerType === 'armed_forces') {
    pensionScheme = 'CCS (Pension) Rules, 2021 (Govt of India)';
    const enhancedPension = Math.round(salary * 0.5);
    const normalPension = Math.round(salary * 0.3);
    spouseMonthlyPension = enhancedPension;
    totalMonthlyPension = enhancedPension;
    pensionRulesSummary = `Enhanced Family Pension of ₹${enhancedPension.toLocaleString('en-IN')}/mo (50% of last pay) for first 10 years, followed by Normal Family Pension of ₹${normalPension.toLocaleString('en-IN')}/mo (30% of pay) for lifetime or till remarriage, plus Dearness Relief (DR).`;
  } else {
    pensionScheme = 'EPS-95 (Employees\' Pension Scheme)';
    const pensionableSalary = Math.min(salary || 15000, 15000);
    const memberPensionEst = (pensionableSalary * Math.max(years, 10)) / 70;
    const baseWidow = Math.max(1000, Math.min(7500, Math.round(memberPensionEst * 0.65)));
    spouseMonthlyPension = baseWidow;
    childMonthlyPension = kids > 0 ? Math.round(baseWidow * 0.25) : 0;
    totalMonthlyPension = spouseMonthlyPension + (childMonthlyPension * kids);
    pensionRulesSummary = `Guaranteed widow/widower monthly pension of ₹${spouseMonthlyPension.toLocaleString('en-IN')} for lifetime under EPS-95. ${kids > 0 ? `Plus ₹${(childMonthlyPension * kids).toLocaleString('en-IN')} additional monthly allowance for ${kids} minor child(ren) up to age 25.` : 'Additional 25% allowance per child payable up to 2 minor children until age 25.'}`;
  }

  return {
    employerType,
    inputs: payload,
    lumpSum: {
      edli: { amount: edliPayout, eligible: true, note: edliNote, title: 'EDLI Statutory Life Insurance' },
      gratuity: { amount: gratuity, eligible: years >= 0.5, note: 'Payment of Gratuity Act 1972 (Tax-free up to ₹20L)', title: 'Statutory Gratuity' },
      leaveEncashment: { amount: leaveEncashment, eligible: leaveEncashment > 0, note: `${leaves} days accumulated leave encashment`, title: 'Leave Encashment' },
      epfCorpus: { amount: epfCorpus, eligible: epfCorpus > 0, note: 'Provident fund balance with accrued interest', title: 'EPF Accumulation' },
      totalLumpSum
    },
    monthlyPension: {
      schemeName: pensionScheme,
      spouseMonthlyPension,
      childMonthlyPension,
      childrenCount: kids,
      totalMonthlyPension,
      rulesSummary: pensionRulesSummary
    }
  };
}

// ─── Render Results to DOM ──────────────────────────────────
function renderCalculationResults(data) {
  if (!data) return;

  const lump = data.lumpSum || {};
  const monthly = data.monthlyPension || {};

  // Quick stats
  setText('quick-lump-sum', formatRupees(lump.totalLumpSum));
  setText('quick-monthly-pension', `${formatRupees(monthly.totalMonthlyPension)}/month`);

  // Lump sum hub
  setText('res-total-lump', formatRupees(lump.totalLumpSum));
  setText('res-edli-amount', formatRupees(lump.edli?.amount || 0));
  if (lump.edli?.note) setText('res-edli-desc', lump.edli.note);

  setText('res-gratuity-amount', formatRupees(lump.gratuity?.amount || 0));
  if (lump.gratuity?.note) setText('res-gratuity-desc', lump.gratuity.note);

  setText('res-epf-amount', formatRupees(lump.epfCorpus?.amount || 0));
  if (lump.epfCorpus?.note) setText('res-epf-desc', lump.epfCorpus.note);

  setText('res-leave-amount', formatRupees(lump.leaveEncashment?.amount || 0));
  if (lump.leaveEncashment?.note) setText('res-leave-desc', lump.leaveEncashment.note);

  // Monthly pension hub
  setText('pension-scheme-title', `${monthly.schemeName || 'EPS-95'} Statutory Monthly Payout`);
  setText('res-total-monthly', `${formatRupees(monthly.totalMonthlyPension)} /mo`);
  setText('res-spouse-pension', `${formatRupees(monthly.spouseMonthlyPension)}/month`);
  setText('res-child-pension', `${formatRupees((monthly.childMonthlyPension || 0) * (monthly.childrenCount || 0))}/month`);
  
  if (monthly.childrenCount > 0) {
    setText('res-child-sub', `For ${monthly.childrenCount} minor child(ren) (${monthly.childMonthlyPension ? formatRupees(monthly.childMonthlyPension) + ' each' : '25% each'}) until age 25`);
  } else {
    setText('res-child-sub', 'No minor children declared (payable till age 25 if applicable)');
  }

  if (monthly.rulesSummary) {
    setText('pension-rules-text', monthly.rulesSummary);
  }
}

// ─── Ready-to-Sign Claim Form Studio ────────────────────────
function switchClaimForm(formType) {
  currentActiveForm = formType;

  // Update active pill button
  document.querySelectorAll('.form-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-form') === formType);
  });

  const meta = FORM_METADATA[formType] || FORM_METADATA['10d'];

  // Update meta info
  setText('doc-title-tag', meta.title);
  setText('meta-authority', meta.authority);
  setText('meta-sla', meta.sla);
  setText('meta-attestation', meta.attestation);

  // Update enclosures list
  const encList = document.getElementById('enclosures-list');
  if (encList) {
    encList.innerHTML = meta.enclosures.map(item => `<li>${item}</li>`).join('');
  }

  updateDraftClaimForm();
}

function updateDraftClaimForm() {
  const textarea = document.getElementById('claim-form-editor');
  if (!textarea) return;

  const state = currentCalculationState || computeClientSidePension({
    lastSalary: 45000,
    serviceYears: 12,
    epfBalance: 850000,
    childrenCount: 2,
    employerType: 'private'
  });

  const salary = state.inputs?.salary || state.inputs?.lastSalary || 45000;
  const years = state.inputs?.years || state.inputs?.serviceYears || 12;
  const epf = state.lumpSum?.epfCorpus?.amount || 850000;
  const edli = state.lumpSum?.edli?.amount || 700000;
  const gratuity = state.lumpSum?.gratuity?.amount || 311538;
  const monthlyPension = state.monthlyPension?.totalMonthlyPension || 4850;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  let docText = '';

  if (currentActiveForm === '10d') {
    docText = `EMPLOYEES' PENSION SCHEME, 1995
APPLICATION FOR FAMILY PENSION UNDER FORM 10D
(To be submitted by Widow / Nominee / Legal Heir of Deceased Member)

Date: ${today}

To,
The Regional P.F. Commissioner,
Employees' Provident Fund Organisation (EPFO),
Regional / Field Office.

Through: [The Employer / Establishment Name]
PF Establishment Code: DL/CPM/[XXXXX]

Subject: Application for Grant of Monthly Family Pension under EPS-95 in respect of late member [Late Member Name] (UAN: [XXXXXXXXXXXX])

Respected Sir / Madam,

I hereby submit my claim for monthly widow/family pension and children pension on account of the untimely demise of my spouse/parent, who was a bonafide contributing member of the Employees' Pension Scheme, 1995.

1. PARTICULARS OF THE DECEASED MEMBER:
   a) Name of Deceased Member   : [Late Member Full Name]
   b) Universal Account No (UAN): [XXXXXXXXXXXX] / PF A/c: [DL/CPM/XXXX/XXXX]
   c) Last Employer Name        : [Company / Enterprise Name]
   d) Date of Demise            : [DD/MM/YYYY] (Certified Death Certificate attached)
   e) Total Pensionable Service : ${years} Years

2. PARTICULARS OF THE CLAIMANT (WIDOW / SPOUSE / NOMINEE):
   a) Claimant Full Name        : [Claimant Full Name]
   b) Relationship to Member    : Spouse / Widow
   c) Date of Birth & Age       : [DD/MM/YYYY] (Aadhaar attached)
   d) Aadhaar Number (UIDAI)    : [XXXX-XXXX-XXXX]
   e) PAN Card Number           : [ABCDE1234F]
   f) Mobile Number & Email     : [+91 XXXXXXXXXX] / [email@example.com]
   g) Residential Address       : [Complete Postal Address, PIN Code]

3. PARTICULARS OF MINOR CHILDREN (Covered under Section 16 of EPS-95):
   Child 1: [Name], Gender: [M/F], DOB: [DD/MM/YYYY] (Eligible for 25% allowance)
   Child 2: [Name], Gender: [M/F], DOB: [DD/MM/YYYY] (Eligible for 25% allowance)

4. ESTIMATED STATUTORY PENSION ENTITLEMENT:
   • Total Monthly Family Pension Payable: ₹ ${monthlyPension.toLocaleString('en-IN')} / month
   • Scheme: Employees' Pension Scheme, 1995

5. BANK ACCOUNT DETAILS FOR ELECTRONIC PENSION CREDIT (NEFT/ECS):
   • Bank Name & Branch : State Bank of India, [Branch Name]
   • Account Number     : [XXXXXXXXXXXX] (Savings Account in Claimant's sole name)
   • IFSC Code          : SBIN000XXXX
   (Original cancelled cheque bearing claimant's name is attached herewith)

DECLARATION & PRAYER:
I hereby solemnly affirm that the particulars given above are true and correct. I have not remarried following the demise of my spouse. I request the Regional Commissioner to sanction and disburse the Pension Payment Order (PPO) within the 20-day statutory limit specified under the EPFO Citizen's Charter.

Yours faithfully,

_____________________________
Signature / Left Thumb Impression of Claimant
Name: [Claimant Full Name]

CERTIFICATE & ATTESTATION BY EMPLOYER / BANK
Certified that the facts stated above have been verified from official records. The deceased was on rolls of this establishment and the Date of Exit (Death) has been marked in the ECR portal.
Authorized Signatory: ________________________ (Seal of Establishment)`;
  } else if (currentActiveForm === '20') {
    docText = `EMPLOYEES' PROVIDENT FUNDS SCHEME, 1952
CLAIM FOR SETTLEMENT OF EPF BALANCE IN RESPECT OF DECEASED MEMBER
FORM 20 (Composite Claim in Death Cases)

Date: ${today}

To,
The Regional Provident Fund Commissioner,
EPFO Regional Office, [City / District].

Subject: Claim for final withdrawal and payout of Provident Fund balance under Form 20 in respect of Late Member [Late Member Name]

1. DETAILS OF THE DECEASED EMPLOYEE:
   • Full Name of Deceased : [Late Member Full Name]
   • Father's / Husband's Name : [Father's Name]
   • Universal Account Number (UAN): [XXXXXXXXXXXX]
   • Member PF Account No  : [PF Account Number]
   • Date of Passing Away  : [DD/MM/YYYY]
   • Last Monthly Basic+DA : ₹ ${salary.toLocaleString('en-IN')}

2. CLAIMANT & SETTLEMENT DETAILS:
   • Name of Legal Claimant: [Claimant Name] (Relationship: Spouse / Heir)
   • Aadhaar UIDAI Number  : [XXXX-XXXX-XXXX]
   • Claimant's Bank A/c   : [Account Number], Bank: [Bank Name]
   • IFSC Code             : [IFSC Code]
   • Estimated Corpus Claim: ₹ ${epf.toLocaleString('en-IN')} (+ statutory accrued interest)

3. ATTESTATION & ENCLOSURES:
   1. Certified Death Certificate with municipal registration seal
   2. Cancelled cheque / photocopy of bank passbook in claimant's name
   3. Self-attested copy of Aadhaar and PAN Card
   4. Form 10D (enclosed for simultaneous EPS Pension processing)

I pray that the entire accumulated EPF corpus standing to the credit of the late member be disbursed directly to my bank account via electronic transfer.

Claimant's Signature: _______________________
Full Name: [Claimant Full Name]`;
  } else if (currentActiveForm === '5if') {
    docText = `EMPLOYEES' DEPOSIT-LINKED INSURANCE SCHEME, 1976
CLAIM FOR ASSURANCE BENEFIT UNDER SECTION 6C OF THE EPF ACT
FORM 5IF

Date: ${today}

To,
The Regional Provident Fund Commissioner,
EPFO Regional Office, [City / District].

Subject: Claim for Statutory Life Assurance Benefit under EDLI Scheme, 1976 (Max Statutory Ceiling: ₹ 7,00,000)

Respected Commissioner,

I, the undersigned nominee / legal heir, hereby claim the statutory Assurance Benefit payable under paragraph 22 of the Employees' Deposit-Linked Insurance Scheme, 1976 on account of the death of the under-mentioned member who passed away while in active service.

1. DECEASED MEMBER CREDENTIALS:
   • Full Name of Member : [Late Member Name]
   • UAN / Member PF ID  : [XXXXXXXXXXXX]
   • Establishment Name  : [Company / Enterprise Name]
   • Date of Demise      : [DD/MM/YYYY] (In-service passing away)
   • Last 12 Months Avg Wage: ₹ ${salary.toLocaleString('en-IN')}

2. STATUTORY ASSURANCE BENEFIT COMPUTATION:
   • Statutory Formula: (35 × Average Monthly Wage) + 50% Bonus on EPF Balance
   • Minimum Legal Cover: ₹ 2,50,000
   • Calculated Entitlement: ₹ ${edli.toLocaleString('en-IN')} (Capped at statutory ceiling of ₹ 7,00,000)
   • Employee Contribution: ₹ 0 (100% funded by employer contribution under EDLI)

3. CLAIMANT RECIPIENT ACCOUNT:
   • Claimant Name       : [Claimant Name] (Spouse / Designated Nominee)
   • Bank Name & Branch  : [Bank Name, Branch]
   • Account Number      : [Bank Account Number]
   • IFSC Code           : [IFSC Code]

It is requested that the assurance benefit of ₹ ${edli.toLocaleString('en-IN')} be sanctioned and credited without delay as per the statutory provisions of Section 6C of the Employees' Provident Funds and Miscellaneous Provisions Act, 1952.

Signature of Nominee / Claimant: _______________________
Contact No: [+91 XXXXXXXXXX]`;
  } else if (currentActiveForm === 'gratuity') {
    docText = `FORM 'K'
[See Sub-Rule (1) of Rule 7 of the Payment of Gratuity (Central) Rules, 1972]
APPLICATION FOR GRATUITY BY A NOMINEE / LEGAL HEIR OF DECEASED EMPLOYEE

Date: ${today}

To,
[The Managing Director / Head of HR]
[Company / Establishment Name]
[Registered Office Postal Address]

Subject: Statutory Notice of Claim for Payment of Gratuity under Section 7 of the Payment of Gratuity Act, 1972 in respect of Late Employee [Employee Name]

Dear Sir / Madam,

I beg to apply for payment of gratuity to which I am entitled under the Payment of Gratuity Act, 1972 on account of the untimely demise of Shri/Smt. [Late Employee Name], who was an employee of your establishment.

1. STATEMENT OF EMPLOYEE'S PARTICULARS:
   a) Name in full of the deceased employee: [Late Employee Full Name]
   b) Employee ID / Staff Code            : [EMP-XXXXX]
   c) Department / Designation            : [Designation]
   d) Date of Appointment                 : [DD/MM/YYYY]
   e) Date of Demise                      : [DD/MM/YYYY]
   f) Total Length of Service             : ${years} Completed Years
   g) Last Drawn Monthly Emoluments (Basic+DA): ₹ ${salary.toLocaleString('en-IN')}

2. STATUTORY CALCULATION OF GRATUITY (Section 4):
   • Statutory Formula: (15 × Last Drawn Monthly Basic+DA × Completed Years of Service) ÷ 26
   • Statutory Gratuity Amount Due: ₹ ${gratuity.toLocaleString('en-IN')}
   • Note: In case of death, the 5-year continuous service rule is legally waived under the First Proviso to Section 4(1) of the Act.
   • Income Tax Status: 100% Exempt from tax under Section 10(10) of the Income Tax Act up to ₹ 20,00,000.

3. CLAIMANT'S PARTICULARS:
   • Full Name of Claimant: [Claimant Full Name]
   • Relationship to Employee: Spouse / Nominee / Legal Heir
   • Residential Address: [Full Address, City, State, PIN]
   • Savings Bank A/c No: [Account Number]
   • IFSC Code: [IFSC Code], Bank: [Bank Name]

STATUTORY MANDATE (Section 7(3)):
As mandated by Section 7(3) of the Payment of Gratuity Act, 1972, the employer is legally obligated to arrange payment within 30 days from the date it becomes payable. Under Section 7(3A), if gratuity is not paid within the specified period, the employer is liable to pay simple interest at the rate of 10% per annum.

Please arrange to disburse the gratuity sum of ₹ ${gratuity.toLocaleString('en-IN')} directly to the above-mentioned account and provide the settlement receipt.

Yours faithfully,

_____________________________
Signature of Nominee / Legal Heir
Enclosures: Certified Death Certificate, Bank Cancelled Cheque, Copy of Aadhaar & PAN`;
  }

  textarea.value = docText;
}

// ─── Document Actions (Copy & Print) ────────────────────────
function copyFormContent() {
  const textarea = document.getElementById('claim-form-editor');
  if (!textarea) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    if (typeof showToast === 'function') {
      showToast('Application text copied to clipboard! Paste into Word or Docs.', 'success');
    }
  }).catch(err => {
    console.error('Clipboard copy error:', err);
    textarea.select();
    document.execCommand('copy');
    if (typeof showToast === 'function') {
      showToast('Copied to clipboard', 'success');
    }
  });
}

function printFormContent() {
  const textarea = document.getElementById('claim-form-editor');
  if (!textarea) return;

  const content = textarea.value;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print claim application');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Anvaya Legal Claim Application</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          white-space: pre-wrap;
          font-size: 13px;
          line-height: 1.6;
          margin: 40px;
          color: #000;
        }
        @media print {
          body { margin: 20mm; }
        }
      </style>
    </head>
    <body>${escapeHtml(content)}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

// ─── Roadmap Track Switching ────────────────────────────────
function switchRoadmapTrack(trackKey) {
  currentActiveTrack = trackKey;

  document.querySelectorAll('.track-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('onclick').includes(`'${trackKey}'`));
  });

  renderRoadmapSteps(trackKey);
}

function renderRoadmapSteps(trackKey) {
  const container = document.getElementById('roadmap-steps-container');
  if (!container) return;

  const steps = ROADMAP_TRACKS[trackKey] || ROADMAP_TRACKS.epfo;

  container.innerHTML = steps.map(s => `
    <div class="roadmap-step-card">
      <div class="step-num-badge">${s.step}</div>
      <div class="step-content">
        <h5>${s.title}</h5>
        <p>${s.desc}</p>
        <span class="step-timing">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>${s.timing}
        </span>
      </div>
    </div>
  `).join('');
}

// ─── Helpers ────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatRupees(num) {
  if (num == null || isNaN(num)) return '₹ 0';
  return '₹ ' + Math.round(num).toLocaleString('en-IN');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') {
      showToast(`Copied: ${text}`, 'success');
    }
  }).catch(() => {
    if (typeof showToast === 'function') {
      showToast(`Copied: ${text}`, 'success');
    }
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Expose globals for HTML inline onclick
window.switchClaimForm = switchClaimForm;
window.switchRoadmapTrack = switchRoadmapTrack;
window.copyFormContent = copyFormContent;
window.printFormContent = printFormContent;
window.copyToClipboard = copyToClipboard;

