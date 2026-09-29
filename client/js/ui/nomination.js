// nomination.js — High-Efficiency Legal Succession & Court-Bypass Navigator
// Connected to Anvaya API + Portfolio Sync + AI Document Studio

// Fallback demo assets if offline
const DEMO_ASSETS_FALLBACK = [
  { id: 'a3', name: 'Flat in Sector 62, Noida', value: 8500000, type: 'Property', hasNomination: false, institution: 'Real Estate Authority' },
  { id: 'a6', name: 'Gold (Physical)', value: 450000, type: 'Gold', hasNomination: false, institution: 'Home Safe' },
  { id: 'a1', name: 'SBI Savings Account XXXX4521', value: 345000, type: 'Bank Accounts', hasNomination: true, institution: 'State Bank of India' }
];

// State official portal directory
const STATE_PORTALS = {
  Delhi: {
    portalName: 'e-District Delhi (Revenue Department, GNCTD)',
    url: 'https://edistrict.delhigovt.nic.in',
    authority: 'Sub-Divisional Magistrate (SDM) / Tehsildar',
    timeline: '14 Working Days',
    fee: '₹0 Govt Fee (+ ₹10 Court Fee Stamp)',
    serviceName: 'Issuance of Surviving Member Certificate'
  },
  Maharashtra: {
    portalName: 'Aaple Sarkar (Revenue Department, GoM)',
    url: 'https://aaplesarkar.mahaonline.gov.in',
    authority: 'Tahsildar (Taluka Executive Magistrate)',
    timeline: '21 Working Days',
    fee: '₹33.60 Online Portal Fee',
    serviceName: 'Varas Pramanpatra (वारस प्रमाणपत्र)'
  },
  'Uttar Pradesh': {
    portalName: 'eDistrict UP (Bhurajashva Department)',
    url: 'https://edistrict.up.gov.in',
    authority: 'Tehsildar / Revenue Inspector (Lekhpal verification)',
    timeline: '30 Working Days',
    fee: '₹20 Citizen Service Fee',
    serviceName: 'Varis Dakhila (वारिस प्रमाण पत्र / वरासत)'
  },
  Karnataka: {
    portalName: 'Seva Sindhu / Nadakacheri (Revenue Dept, GoK)',
    url: 'https://sevasindhu.karnataka.gov.in',
    authority: 'Tahasildar / Revenue Inspector (RI Report)',
    timeline: '21 Working Days',
    fee: '₹40 Application Fee',
    serviceName: 'Family Tree / Surviving Family Certificate'
  },
  'Tamil Nadu': {
    portalName: 'TN e-Sevai (Revenue Administration, GoTN)',
    url: 'https://www.tnesevai.tn.gov.in',
    authority: 'Tahsildar (Revenue Divisional Officer inspection)',
    timeline: '15 Working Days',
    fee: '₹60 e-Sevai Service Charge',
    serviceName: 'Legal Heir Certificate (வாரிசு சான்றிதழ்)'
  },
  Telangana: {
    portalName: 'MeeSeva Telangana (Revenue Dept, GoTS)',
    url: 'https://meeseva.telangana.gov.in',
    authority: 'Tahsildar / Mandal Revenue Officer (MRO)',
    timeline: '30 Working Days',
    fee: '₹45 MeeSeva Portal Fee',
    serviceName: 'Late Registration / Legal Heir Certificate'
  },
  'West Bengal': {
    portalName: 'e-District West Bengal (Land & Land Reforms Dept)',
    url: 'https://edistrict.wb.gov.in',
    authority: 'Sub-Divisional Officer (SDO) / BDO',
    timeline: '30 Working Days',
    fee: '₹20 Court Fee Stamp',
    serviceName: 'Succession & Legal Heir Certificate'
  },
  National: {
    portalName: 'National Government Services Portal of India',
    url: 'https://services.india.gov.in',
    authority: 'District Magistrate / Collector / Sub-Divisional Officer',
    timeline: '15 – 30 Working Days',
    fee: 'State Nominal Fee / Stamp Duty',
    serviceName: 'Online Citizen Revenue Certificates'
  }
};

let currentSelectedAsset = null;
let currentDocType = 'noc';

// ─── Initialize ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPage === 'function') {
    initPage('nomination', {
      greeting: 'Legal Succession Fast-Track',
      subtitle: 'When nomination is missing, we show you the shortest legal path'
    });
  }

  loadNonNominatedAssets();
  setupDiagnosticListeners();
  runDiagnosticEngine();
  setupDocStudio();
  setupStatePortalHub();
});

// ─── 1. Live Portfolio Sync (Detect Non-Nominated Assets) ───
async function loadNonNominatedAssets() {
  const banner = document.getElementById('detected-assets-section');
  const chipsContainer = document.getElementById('detected-chips-container');
  const bannerHeading = document.getElementById('detected-banner-heading');
  const bannerDesc = document.getElementById('detected-banner-desc');

  if (!banner || !chipsContainer) return;

  let allAssets = [];
  try {
    const caseId = typeof getCaseId === 'function' ? getCaseId() : null;
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.getAssets) {
      allAssets = await AnvayaApi.getAssets(caseId);
    }
  } catch (err) {
    console.warn('Could not load assets from API, falling back to local list:', err.message);
  }

  if (!Array.isArray(allAssets) || allAssets.length === 0) {
    allAssets = DEMO_ASSETS_FALLBACK;
  }

  // Filter non-nominated assets
  const nonNomAssets = allAssets.filter(a => {
    return a.hasNomination === false || a.hasNomination === 'false' || (a.status && a.status === 'Not Started' && !a.hasNomination);
  });

  if (nonNomAssets.length === 0) {
    banner.style.display = 'none';
    return;
  }

  const totalValue = nonNomAssets.reduce((sum, a) => sum + (Number(a.approximateValue || a.value) || 0), 0);
  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue);

  if (bannerHeading) {
    bannerHeading.textContent = `Found ${nonNomAssets.length} Portfolio Assets Without Nomination (${formattedTotal})`;
  }
  if (bannerDesc) {
    bannerDesc.innerHTML = `These assets have no nominee on file and require legal heir settlement. Click any item to customize your statutory fast-track roadmap:`;
  }

  chipsContainer.innerHTML = '';
  nonNomAssets.forEach((asset, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `detected-asset-chip ${idx === 0 ? 'active' : ''}`;
    const val = Number(asset.approximateValue || asset.value) || 0;
    const formattedVal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    
    chip.innerHTML = `<span>⚠️</span> ${asset.name} (${formattedVal})`;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.detected-asset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectAssetForDiagnostic(asset);
    });

    chipsContainer.appendChild(chip);
  });

  banner.style.display = 'flex';

  // Pre-select first item
  if (nonNomAssets.length > 0) {
    selectAssetForDiagnostic(nonNomAssets[0]);
  }
}

function selectAssetForDiagnostic(asset) {
  currentSelectedAsset = asset;
  const val = Number(asset.approximateValue || asset.value) || 0;
  
  const valSelect = document.getElementById('diagAssetValue');
  const natureSelect = document.getElementById('diagAssetNature');

  if (valSelect) {
    valSelect.value = val < 500000 ? 'under5L' : 'over5L';
  }

  if (natureSelect) {
    const cat = (asset.type || asset.category || '').toLowerCase();
    if (cat.includes('property') || cat.includes('flat') || cat.includes('land') || cat.includes('house')) {
      natureSelect.value = 'immovable';
    } else {
      natureSelect.value = 'movable';
    }
  }

  runDiagnosticEngine();
  updateDraftDocumentContent();

  if (typeof showToast === 'function') {
    showToast(`Loaded "${asset.name}" into Diagnostic Engine`, 'info');
  }
}

// ─── 2. Interactive Court-Bypass Diagnostic Engine ─────────
function setupDiagnosticListeners() {
  const fields = ['diagAssetValue', 'diagAssetNature', 'diagDisputeStatus', 'diagState'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', runDiagnosticEngine);
    }
  });
}

function runDiagnosticEngine() {
  const valType = document.getElementById('diagAssetValue')?.value || 'under5L';
  const nature = document.getElementById('diagAssetNature')?.value || 'movable';
  const dispute = document.getElementById('diagDisputeStatus')?.value || 'unanimous';
  const state = document.getElementById('diagState')?.value || 'Delhi';

  const verdictBox = document.getElementById('diagnostic-verdict-box');
  if (!verdictBox) return;

  const isFastTrack = (valType === 'under5L' && nature === 'movable' && dispute === 'unanimous');
  const isHighValueMovable = (valType === 'over5L' && nature === 'movable' && dispute === 'unanimous');

  if (isFastTrack) {
    verdictBox.className = 'verdict-box fast-track';
    verdictBox.innerHTML = `
      <div class="verdict-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="verdict-badge badge-green">🏆 Fast-Track Approved</span>
          <h3 class="verdict-title">You Can Bypass Civil Court!</h3>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="scrollToDocStudio()" style="padding: 6px 14px; font-size: 12.5px;">✨ Generate Required Documents</button>
      </div>
      <p style="margin: 0; font-size: 13.5px; color: var(--text-primary); line-height: 1.5;">
        Under <strong>RBI Master Circular on Deceased Depositors (Para 19.3)</strong> and institutional claim thresholds, claims under ₹5 Lakhs with unanimous legal heir consent <strong>do not require a Court Succession Certificate</strong>. You can settle directly at the branch.
      </p>

      <div class="verdict-metrics-grid">
        <div class="verdict-metric">
          <div class="metric-label">Estimated Timeline</div>
          <div class="metric-val" style="color: var(--green-dark,#166534);">15 – 20 Days</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Court Time Saved</div>
          <div class="metric-val" style="color: var(--blue,#2576A6);">~12–18 Months</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Est. Financial Savings</div>
          <div class="metric-val" style="color: var(--green-dark,#166534);">~₹35,000 – ₹50,000</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Issuing Authority</div>
          <div class="metric-val">Tehsildar / SDM</div>
        </div>
      </div>

      <div style="background: rgba(34, 197, 94, 0.08); border-radius: 8px; padding: 12px 14px; font-size: 12.5px; color: #166534; line-height: 1.45;">
        <strong>Statutory Action Plan:</strong> Obtain a Legal Heir Certificate from your local Revenue Department (${state}), have all family heirs sign the <strong>Family NOC</strong> and <strong>₹100 Indemnity Bond</strong> (generated below), and submit directly to the branch.
      </div>
    `;
  } else if (isHighValueMovable) {
    verdictBox.className = 'verdict-box fast-track';
    verdictBox.innerHTML = `
      <div class="verdict-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="verdict-badge badge-blue">ℹ️ High-Value Institutional Settlement</span>
          <h3 class="verdict-title">Branch Settlement with High-Value Indemnity</h3>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="scrollToDocStudio()" style="padding: 6px 14px; font-size: 12.5px;">✨ Generate Documents</button>
      </div>
      <p style="margin: 0; font-size: 13.5px; color: var(--text-primary); line-height: 1.5;">
        Since the assets are movable and all heirs agree, many banks (SBI, HDFC, ICICI, PNB) allow settlement without a court certificate if backed by an <strong>Indemnity Bond with two substantial earning sureties</strong> and a Tehsildar Legal Heir Certificate.
      </p>

      <div class="verdict-metrics-grid">
        <div class="verdict-metric">
          <div class="metric-label">Estimated Timeline</div>
          <div class="metric-val" style="color: var(--blue,#2576A6);">30 – 45 Days</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Sureties Required</div>
          <div class="metric-val">2 Earning Guarantors</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Recommended Path</div>
          <div class="metric-val">Legal Heir Cert + Indemnity</div>
        </div>
      </div>
    `;
  } else {
    verdictBox.className = 'verdict-box court-required';
    const reason = nature === 'immovable'
      ? 'Immovable property (Flat/Land/House) mutation requires a registered Will, Relinquishment Deed, or Civil Court Certificate.'
      : 'When legal heirs have disputes or minor rights are involved, financial institutions will only release funds under a Civil Court Succession Certificate to avoid litigation.';

    verdictBox.innerHTML = `
      <div class="verdict-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="verdict-badge" style="background:#fee2e2; color:#991b1b;">⚖️ Court Procedure Required</span>
          <h3 class="verdict-title">Succession Certificate / Mutation Required</h3>
        </div>
      </div>
      <p style="margin: 0; font-size: 13.5px; color: var(--text-primary); line-height: 1.5;">
        ${reason} A formal petition must be filed before the competent Civil Court of the District Judge under <strong>Section 372 of the Indian Succession Act, 1925</strong>.
      </p>

      <div class="verdict-metrics-grid">
        <div class="verdict-metric">
          <div class="metric-label">Estimated Timeline</div>
          <div class="metric-val" style="color: var(--gold,#b45309);">6 – 12 Months</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Court Fee</div>
          <div class="metric-val">2% – 3% Ad-Valorem</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Mandatory Step</div>
          <div class="metric-val">Newspaper Citation (30d)</div>
        </div>
        <div class="verdict-metric">
          <div class="metric-label">Jurisdiction</div>
          <div class="metric-val">District Judge (${state})</div>
        </div>
      </div>
    `;
  }
}

// ─── 3. AI Legal Document Studio (Affidavit, NOC, Indemnity) ─
function setupDocStudio() {
  const pills = document.querySelectorAll('.doc-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      pills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      currentDocType = e.target.dataset.docType;
      updateDraftDocumentContent();
    });
  });

  const copyBtn = document.getElementById('btnCopyDraftDoc');
  if (copyBtn) copyBtn.addEventListener('click', handleCopyDraftDoc);

  const printBtn = document.getElementById('btnPrintDraftDoc');
  if (printBtn) printBtn.addEventListener('click', handlePrintDraftDoc);

  updateDraftDocumentContent();
}

function updateDraftDocumentContent() {
  const titleDisplay = document.getElementById('doc-title-display');
  const textarea = document.getElementById('draftDocumentTextarea');
  if (!textarea) return;

  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const assetName = currentSelectedAsset ? currentSelectedAsset.name : 'Specified Financial Asset';
  const instName = currentSelectedAsset ? (currentSelectedAsset.institution || 'State Bank of India') : 'Banking / Financial Institution';
  const accNo = currentSelectedAsset ? (currentSelectedAsset.accountNumber || 'XXXX-XXXX-XXXX') : 'XXXX-XXXX-XXXX';
  const val = currentSelectedAsset ? Number(currentSelectedAsset.approximateValue || currentSelectedAsset.value || 0) : 345000;
  const formattedVal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (currentDocType === 'noc') {
    if (titleDisplay) titleDisplay.textContent = 'FAMILY NO-OBJECTION & CONSENT DECLARATION (NOC)';
    textarea.value = `NO-OBJECTION CERTIFICATE & CONSENT DECLARATION BY LEGAL HEIRS

Date: ${todayStr}

To,
The Branch Manager / Competent Authority,
${instName},
[Branch Address]

Subject: No-Objection Certificate (NOC) for Release & Settlement of Asset / Account No. ${accNo} held in the name of Late [Deceased Name]

Respected Sir / Madam,

We, the undersigned, being the surviving Class-I legal heirs of the deceased Late [Deceased Name], who departed on [Date of Death], hereby jointly and severally declare as follows:

1. That Late [Deceased Name] was the sole holder of ${assetName} (A/c / Folio / Ref: ${accNo}) with approximate valuation of ${formattedVal} with your institution.

2. That the deceased did not execute any registered Will during their lifetime and died intestate without leaving a registered nominee on the aforesaid asset.

3. That we have mutually agreed and have NO OBJECTION whatsoever to the entire balance, interest, and proceeds of the aforesaid asset being released, transferred, and settled solely in favor of:
   - Full Name: [Primary Claimant Legal Heir Name]
   - Relationship to Deceased: [Son / Daughter / Spouse]
   - Aadhaar No.: [XXXX-XXXX-XXXX]
   - Bank Account for Transfer: [Bank Name, A/c No, IFSC]

4. We hereby unconditionally relinquish our immediate claim on the proceeds of the above asset in favor of the claimant named above and affirm that this settlement shall constitute a valid and complete discharge to the institution.

Executed at [City/State] on this ${todayStr}.

SIGNATURES OF CONSENTING LEGAL HEIRS:

1. ___________________________
   Name: [Legal Heir 1 Name] | Relation: [Son/Daughter/Spouse] | Mobile: [Phone]
   Aadhaar: [XXXX-XXXX-XXXX]

2. ___________________________
   Name: [Legal Heir 2 Name] | Relation: [Son/Daughter/Spouse] | Mobile: [Phone]
   Aadhaar: [XXXX-XXXX-XXXX]

3. ___________________________
   Name: [Legal Heir 3 Name] | Relation: [Son/Daughter/Spouse] | Mobile: [Phone]
   Aadhaar: [XXXX-XXXX-XXXX]

BEFORE ME,
NOTARY PUBLIC (GOVT. OF INDIA)
[Seal & Bar Registration Number]`;
  } else if (currentDocType === 'affidavit') {
    if (titleDisplay) titleDisplay.textContent = 'LEGAL HEIR AFFIDAVIT (ON ₹100 NON-JUDICIAL STAMP PAPER)';
    textarea.value = `BEFORE THE NOTARY PUBLIC / EXECUTIVE MAGISTRATE AT [CITY/STATE]

AFFIDAVIT OF LEGAL HEIRSHIP UNDER INDIAN SUCCESSION ACT

I, [Claimant Full Name], [Son/Daughter/Spouse] of Late [Deceased Name], aged about [Age] years, residing at [Permanent Residential Address], do hereby solemnly affirm and declare on oath as under:

1. That I am a citizen of India and competent to swear this affidavit.

2. That my [relation], Late [Deceased Name], expired on [Date of Death] at [Place of Death]. A true certified copy of the Death Certificate issued by the Municipal Corporation / Registrar is annexed hereto as Annexure-A.

3. That the deceased died intestate (without executing any Will or testamentary disposition).

4. That following are the ONLY surviving legal heirs of the deceased under the Hindu Succession Act / applicable personal succession laws:
   i.   [Name 1] - Relationship: [Spouse] - Age: [XX] - Address: [Address]
   ii.  [Name 2] - Relationship: [Son]    - Age: [XX] - Address: [Address]
   iii. [Name 3] - Relationship: [Daughter] - Age: [XX] - Address: [Address]

5. That apart from the persons mentioned above, there are no other legal heirs, adopted children, or claimants entitled to any share in the estate of the deceased.

6. That the deceased held ${assetName} (A/c No: ${accNo}) at ${instName}, having an estimated value of ${formattedVal}.

7. That this affidavit is executed for submission to ${instName} and the Revenue Authorities for the purpose of processing the transmission and settlement of the deceased's asset.

DEPONENT
___________________________
[Claimant Full Name]

VERIFICATION:
Verified at [City] on this ${todayStr}, that the contents of paragraphs 1 to 7 of this affidavit are true and correct to my personal knowledge and nothing material has been concealed therefrom.

DEPONENT
___________________________
Identified by Advocate: [Advocate Name & Bar No.]`;
  } else if (currentDocType === 'indemnity') {
    if (titleDisplay) titleDisplay.textContent = 'BANK INDEMNITY BOND WITH TWO (2) SURETIES';
    textarea.value = `FORM OF INDEMNITY BOND FOR DECEASED ACCOUNT CLAIMS (WITHOUT PROBATE / LETTERS OF ADMINISTRATION)
(To be executed on Non-Judicial Stamp Paper of appropriate value as per State Stamp Act)

THIS DEED OF INDEMNITY is made this ${todayStr} by:

1. [Claimant Name], [Son/Daughter/Spouse] of Late [Deceased Name], residing at [Address] (hereinafter called "the Principal Claimant")
AND
2. [Surety 1 Full Name], residing at [Address], earning an annual income of ₹[Income] (hereinafter called "Surety No. 1")
3. [Surety 2 Full Name], residing at [Address], earning an annual income of ₹[Income] (hereinafter called "Surety No. 2")

IN FAVOR OF:
${instName}, a banking corporation having its branch at [Branch Address] (hereinafter called "the Bank").

WHEREAS:
1. Late [Deceased Name] was maintaining ${assetName} (Account / Folio No. ${accNo}) with the Bank, having a balance / value of ${formattedVal}.
2. The account holder died intestate on [Date of Death] without a registered nominee.
3. The Principal Claimant has requested the Bank to settle and pay the said amount without production of a Court Succession Certificate.

NOW THIS DEED WITNESSETH AS FOLLOWS:
In consideration of the Bank paying the sum of ${formattedVal} to the Principal Claimant without insisting upon a Grant of Probate or Succession Certificate, WE, the Principal Claimant and the Sureties, DO HEREBY JOINTLY AND SEVERALLY AGREE AND UNDERTAKE to indemnify the Bank, its successors, and assigns against all claims, demands, proceedings, losses, and damages which may be brought against or incurred by the Bank by reason of making the aforesaid payment.

IN WITNESS WHEREOF, the parties hereto have set their hands on the day and year first above written.

1. ___________________________ (Principal Claimant)
   Name: [Claimant Name] | PAN: [PAN]

2. ___________________________ (Surety No. 1)
   Name: [Surety 1 Name] | Employer/Business: [Details] | PAN: [PAN]

3. ___________________________ (Surety No. 2)
   Name: [Surety 2 Name] | Employer/Business: [Details] | PAN: [PAN]

WITNESSES:
1. Name: _____________________ | Address: ___________________________
2. Name: _____________________ | Address: ___________________________`;
  }
}

function handleCopyDraftDoc() {
  const textarea = document.getElementById('draftDocumentTextarea');
  if (!textarea || !textarea.value) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    if (typeof showToast === 'function') showToast('Legal draft copied to clipboard! Paste into Word or Docs.', 'success');
  }).catch(() => {
    textarea.select();
    document.execCommand('copy');
    if (typeof showToast === 'function') showToast('Legal draft copied to clipboard!', 'success');
  });
}

function handlePrintDraftDoc() {
  const text = document.getElementById('draftDocumentTextarea')?.value;
  if (!text) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Legal Succession Document - Anvaya</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13.5pt; line-height: 1.6; margin: 40px; color: #000; }
        pre { font-family: inherit; font-size: inherit; white-space: pre-wrap; word-break: break-word; }
        @media print { body { margin: 20mm; } }
      </style>
    </head>
    <body>
      <pre>${text}</pre>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

function scrollToDocStudio() {
  const section = document.getElementById('doc-studio-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── 4. State-wise E-District Direct Application Hub ───────
function setupStatePortalHub() {
  const dropdown = document.getElementById('statePortalDropdown');
  if (dropdown) {
    dropdown.addEventListener('change', (e) => {
      renderStatePortalInfo(e.target.value);
    });
    renderStatePortalInfo(dropdown.value || 'Delhi');
  }
}

function renderStatePortalInfo(stateKey) {
  const infoBox = document.getElementById('state-portal-info-box');
  if (!infoBox) return;

  const stateData = STATE_PORTALS[stateKey] || STATE_PORTALS.National;

  infoBox.innerHTML = `
    <div style="flex: 1; min-width: 260px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">Official Revenue Portal</span>
        <span style="font-size: 12px; color: var(--text-muted);">${stateKey}</span>
      </div>
      <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: var(--navy,#0A192F);">${stateData.portalName}</h3>
      <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">
        • <strong>Official Service:</strong> ${stateData.serviceName}<br>
        • <strong>Designated Officer:</strong> ${stateData.authority}<br>
        • <strong>Statutory Timeline:</strong> ${stateData.timeline} | <strong>Fee:</strong> ${stateData.fee}
      </div>
    </div>
    <div>
      <a href="${stateData.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; font-size: 13.5px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        <span>🔗</span> Open ${stateKey} Portal &rarr;
      </a>
    </div>
  `;
}

// ─── Step Wizard & Checklist Logic ─────────────────────────
function toggleStep(stepNumber) {
  const steps = [1, 2, 3, 4];
  
  steps.forEach(step => {
    const card = document.getElementById(`step-${step}`);
    if (!card) return;
    const content = card.querySelector('.step-content');
    const icon = card.querySelector('.toggle-icon');
    
    if (step === stepNumber) {
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'block';
      icon.textContent = isVisible ? '▶' : '▼';
      if (!isVisible) card.classList.add('active');
      else card.classList.remove('active');
    } else {
      content.style.display = 'none';
      icon.textContent = '▶';
      card.classList.remove('active');
    }
  });
}

function completeStep(stepNumber) {
  const currentCard = document.getElementById(`step-${stepNumber}`);
  if (currentCard) {
    currentCard.classList.add('completed');
  }
  
  const nextStep = stepNumber + 1;
  if (nextStep <= 4) {
    toggleStep(nextStep);
    setTimeout(() => {
      const nextCard = document.getElementById(`step-${nextStep}`);
      if (nextCard) {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  } else {
    if (typeof showToast === 'function') {
      showToast('All statutory steps marked complete!', 'success');
    }
  }
}

function toggleChecklist() {
  const content = document.getElementById('documents-checklist');
  const icon = document.getElementById('checklist-icon');
  
  if (content.style.display !== 'none') {
    content.style.display = 'none';
    icon.textContent = '▶';
  } else {
    content.style.display = 'block';
    icon.textContent = '▼';
  }
}

// Global exports for HTML inline handlers
window.toggleStep = toggleStep;
window.completeStep = completeStep;
window.toggleChecklist = toggleChecklist;
window.scrollToDocStudio = scrollToDocStudio;
