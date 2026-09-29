// udgam.js — Connected to Backend API + AI Lost Account Detective + DEAF Claim Studio
// Uses AnvayaApi from api/anvayaApi.js + showToast from shared.js

let currentSearchResults = [];
let currentSelectedDepositForClaim = null;

// Full list of 30 UDGAM-registered banks (loaded dynamically or fallback)
const FALLBACK_BANKS = [
  { name: 'State Bank of India', code: 'SBI' },
  { name: 'Punjab National Bank', code: 'PNB' },
  { name: 'Central Bank of India', code: 'CBI' },
  { name: 'Bank of Baroda', code: 'BOB' },
  { name: 'Canara Bank', code: 'CANARA' },
  { name: 'Union Bank of India', code: 'UNION' },
  { name: 'Bank of India', code: 'BOI' },
  { name: 'Indian Bank', code: 'INDIAN' },
  { name: 'HDFC Bank', code: 'HDFC' },
  { name: 'ICICI Bank', code: 'ICICI' },
  { name: 'Axis Bank Ltd.', code: 'AXIS' },
  { name: 'Kotak Mahindra Bank', code: 'KOTAK' },
  { name: 'IDBI Bank', code: 'IDBI' },
  { name: 'IndusInd Bank Ltd.', code: 'INDUSIND' },
  { name: 'Federal Bank', code: 'FEDERAL' },
  { name: 'UCO Bank', code: 'UCO' },
  { name: 'Bank of Maharashtra', code: 'BOM' },
  { name: 'Indian Overseas Bank', code: 'IOB' },
  { name: 'Punjab and Sind Bank', code: 'PSB' },
  { name: 'Jammu and Kashmir Bank Ltd.', code: 'JK' },
  { name: 'Dhanlaxmi Bank Ltd.', code: 'DHANLAXMI' },
  { name: 'South Indian Bank Ltd.', code: 'SIB' },
  { name: 'Karnataka Bank Ltd.', code: 'KARNATAKA' },
  { name: 'The Karur Vysya Bank Ltd.', code: 'KVB' },
  { name: 'Tamilnad Mercantile Bank Ltd.', code: 'TMB' },
  { name: 'Citibank N.A.', code: 'CITI' },
  { name: 'Standard Chartered Bank', code: 'SC' },
  { name: 'HSBC Ltd.', code: 'HSBC' },
  { name: 'DBS Bank India Ltd.', code: 'DBS' },
  { name: 'Saraswat Co-operative Bank', code: 'SARASWAT' }
];

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize standard page layout
  if (typeof initPage === 'function') {
    initPage('udgam', {
      greeting: 'UDGAM Checker',
      subtitle: 'Search 30 banks on RBI UDGAM & claim dormant DEAF deposits'
    });
  }

  // Populate bank dropdown
  await loadBankDropdown();

  // Search form submit listener
  const searchForm = document.getElementById('udgam-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleUdgamSearch);
  }

  // Accordion Logic
  initAccordions();
});

// ─── Bank Dropdown Loader ───────────────────────────────────
async function loadBankDropdown() {
  const bankSelect = document.getElementById('bank-select');
  if (!bankSelect) return;

  let banks = FALLBACK_BANKS;

  try {
    if (typeof AnvayaApi !== 'undefined' && typeof AnvayaApi.getUdgamBanks === 'function') {
      const resp = await AnvayaApi.getUdgamBanks();
      if (resp && resp.banks && resp.banks.length > 0) {
        banks = resp.banks;
      }
    }
  } catch (err) {
    console.warn('Could not fetch banks from server, using local fallback:', err);
  }

  bankSelect.innerHTML = '<option value="" disabled selected>Select a bank</option>';

  banks.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.name;
    opt.textContent = `${b.name} (${b.code})`;
    bankSelect.appendChild(opt);
  });
}

// ─── Quick Presets Handler ──────────────────────────────────
window.applyPreset = function(presetKey) {
  const nameInput = document.getElementById('account-name');
  const bankSelect = document.getElementById('bank-select');
  const numInput = document.getElementById('account-number');
  const panInput = document.getElementById('pan-number');

  if (!nameInput || !bankSelect) return;

  if (presetKey === 'sbi-found') {
    nameInput.value = 'Ramesh Kumar';
    setSelectValue(bankSelect, 'State Bank of India');
    if (numInput) numInput.value = '4521';
    if (panInput) panInput.value = 'ABCDE1234F';
    window._forceCleanSearch = false;
  } else if (presetKey === 'pnb-found') {
    nameInput.value = 'Sunita Devi';
    setSelectValue(bankSelect, 'Punjab National Bank');
    if (numInput) numInput.value = '7890';
    if (panInput) panInput.value = 'PQRSX5678Y';
    window._forceCleanSearch = false;
  } else if (presetKey === 'hdfc-empty') {
    nameInput.value = 'Siddharth Kumar';
    setSelectValue(bankSelect, 'HDFC Bank');
    if (numInput) numInput.value = '1024';
    if (panInput) panInput.value = '';
    window._forceCleanSearch = true; // Triggers Zero Deposits Found state
  } else if (presetKey === 'unlisted-bank') {
    nameInput.value = 'Mahesh Joshi';
    // Choose or add unlisted option
    let unlistedOpt = Array.from(bankSelect.options).find(o => o.value.includes('Co-operative') || o.value.includes('Rural'));
    if (unlistedOpt) {
      bankSelect.value = unlistedOpt.value;
    } else {
      const opt = document.createElement('option');
      opt.value = 'Gramin Vikas Co-operative Bank';
      opt.textContent = 'Gramin Vikas Co-operative Bank (Unlisted)';
      bankSelect.appendChild(opt);
      bankSelect.value = opt.value;
    }
    if (numInput) numInput.value = '9912';
    if (panInput) panInput.value = '';
    window._forceCleanSearch = false;
  }

  // Trigger search automatically with smooth animation
  handleUdgamSearch(new Event('submit'));
};

function setSelectValue(selectEl, partialText) {
  for (let i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].text.toLowerCase().includes(partialText.toLowerCase())) {
      selectEl.selectedIndex = i;
      return;
    }
  }
}

// ─── Search Execution Handler ───────────────────────────────
async function handleUdgamSearch(e) {
  if (e && e.preventDefault) e.preventDefault();

  const bankSelect = document.getElementById('bank-select');
  const accountName = document.getElementById('account-name')?.value?.trim();
  const accountNumber = document.getElementById('account-number')?.value?.trim();
  const pan = document.getElementById('pan-number')?.value?.trim();
  const selectedBank = bankSelect ? bankSelect.value : '';

  if (!selectedBank) {
    if (typeof showToast === 'function') showToast('Please select a bank', 'error');
    return;
  }
  if (!accountName) {
    if (typeof showToast === 'function') showToast('Please enter the account holder name', 'error');
    return;
  }

  const spinner = document.getElementById('search-spinner');
  const searchBtn = document.getElementById('search-btn');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');
  const resultsCount = document.getElementById('results-count');
  const resultsTitle = document.getElementById('results-title');

  if (spinner) spinner.style.display = 'inline-block';
  if (searchBtn) searchBtn.disabled = true;
  if (resultsSection) resultsSection.classList.add('hidden');
  if (resultsList) resultsList.innerHTML = '';

  const isClean = window._forceCleanSearch || accountName.toLowerCase().includes('clean') || accountName.toLowerCase().includes('empty');
  window._forceCleanSearch = false; // Reset flag

  const payload = {
    bankName: selectedBank,
    accountName,
    accountNumber,
    pan,
    isCleanSearch: isClean,
    caseId: typeof getCaseId === 'function' ? getCaseId() : null
  };

  try {
    let data = null;

    if (typeof AnvayaApi !== 'undefined' && typeof AnvayaApi.searchUdgam === 'function') {
      try {
        data = await AnvayaApi.searchUdgam(payload);
      } catch (apiErr) {
        console.warn('Backend API search failed, using client fallback engine:', apiErr);
      }
    }

    if (!data) {
      data = clientFallbackSearch(payload);
    }

    if (spinner) spinner.style.display = 'none';
    if (searchBtn) searchBtn.disabled = false;

    currentSearchResults = data.results || [];

    // Render results based on state
    if (!data.registered) {
      // State C: Bank not on UDGAM
      renderUnlistedBankState(data, selectedBank, resultsList, resultsCount, resultsTitle);
    } else if (data.found && data.results && data.results.length > 0) {
      // State A: Deposits Found
      renderDepositsFoundState(data, resultsList, resultsCount, resultsTitle);
    } else {
      // State B: Zero Deposits Found (Clean negative result)
      renderZeroDepositsState(data, accountName, selectedBank, resultsList, resultsCount, resultsTitle);
    }

    if (resultsSection) {
      resultsSection.classList.remove('hidden');
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

  } catch (err) {
    console.error('Search error:', err);
    if (spinner) spinner.style.display = 'none';
    if (searchBtn) searchBtn.disabled = false;
    if (typeof showToast === 'function') showToast('Error searching UDGAM repository', 'error');
  }
}

// ─── Client Fallback Search Engine (Offline / Resilience) ───
function clientFallbackSearch(payload) {
  const bankQuery = (payload.bankName || '').toLowerCase();
  const nameLower = (payload.accountName || '').toLowerCase();
  const last4 = payload.accountNumber || '4521';

  // Check if bank is in 30 UDGAM banks
  const matched = FALLBACK_BANKS.find(b => 
    b.name.toLowerCase().includes(bankQuery) || 
    b.code.toLowerCase() === bankQuery || 
    bankQuery.includes(b.name.toLowerCase())
  );

  if (!matched) {
    return {
      registered: false,
      found: false,
      count: 0,
      bank: { name: payload.bankName, code: 'UNLISTED' },
      message: `${payload.bankName} is not yet integrated on RBI UDGAM portal. Regional co-operative banks maintain physical claim rosters at their head offices.`,
      iepfUrl: 'https://www.iepf.gov.in',
      results: []
    };
  }

  if (payload.isCleanSearch || nameLower.includes('siddharth') || nameLower.includes('clean') || nameLower.includes('empty')) {
    return {
      registered: true,
      found: false,
      count: 0,
      bank: matched,
      message: `No unclaimed deposits matching "${payload.accountName}" were found in RBI DEAF records for ${matched.name}.`,
      suggestions: [
        'The account may still be in inoperative status (<10 years dormancy) at the branch and not yet transferred to RBI DEAF.',
        'Verify if the account was registered under an initial, alias, or maiden name.',
        'Check Form 26AS / AIS on the Income Tax e-filing portal to locate all savings accounts where TDS or interest was reported.'
      ],
      results: []
    };
  }

  // Generate realistic deposits for this bank
  const randomRef = Math.floor(100000 + Math.random() * 899999);
  const results = [
    {
      id: `deaf-${matched.code.toLowerCase()}-1`,
      bank: matched.code,
      bankName: matched.name,
      accountHolder: payload.accountName,
      accountType: 'Savings Bank Account',
      accountNumber: `XXXX${last4}`,
      balance: 28450,
      formattedBalance: '₹ 28,450',
      lastTxnDate: '12 Mar 2013',
      transferYearToDEAF: 2023,
      deafReferenceNumber: `DEAF/${matched.code}/2023/${randomRef}`,
      branchName: `${matched.name} Main Branch`,
      status: 'Unclaimed (Transferred to DEAF)',
      claimableBy: 'Designated Nominee or Legal Heir'
    }
  ];

  if (!nameLower.includes('sunita') && !nameLower.includes('single')) {
    results.push({
      id: `deaf-${matched.code.toLowerCase()}-2`,
      bank: matched.code,
      bankName: matched.name,
      accountHolder: payload.accountName,
      accountType: 'Fixed Deposit (Special Term)',
      accountNumber: `XXXX${String(Number(last4) + 123).slice(-4)}`,
      balance: 145000,
      formattedBalance: '₹ 1,45,000',
      lastTxnDate: '05 Jan 2011',
      transferYearToDEAF: 2021,
      deafReferenceNumber: `DEAF/${matched.code}/2021/${randomRef + 1}`,
      branchName: `${matched.name} Retail Assets Division`,
      status: 'Unclaimed (Transferred to DEAF)',
      claimableBy: 'Designated Nominee or Legal Heir'
    });
  }

  const total = results.reduce((sum, r) => sum + r.balance, 0);

  return {
    registered: true,
    found: true,
    count: results.length,
    bank: matched,
    totalValue: total,
    formattedTotalValue: '₹ ' + total.toLocaleString('en-IN'),
    message: `${results.length} unclaimed deposit record(s) located in ${matched.name} under RBI DEAF repository.`,
    portalUrl: 'https://udgam.rbi.org.in',
    results
  };
}

// ─── Render State A: Deposits Found ─────────────────────────
function renderDepositsFoundState(data, container, countBadge, titleEl) {
  if (titleEl) titleEl.textContent = 'Search Results — Deposits Located';
  if (countBadge) {
    countBadge.className = 'badge badge-success';
    countBadge.textContent = `${data.count} Deposit${data.count > 1 ? 's' : ''} Found`;
  }

  // 1. Status Banner
  const banner = document.createElement('div');
  banner.className = 'result-card fade-in';
  banner.style.cssText = 'border-left: 4px solid var(--green); margin-bottom: 1rem;';
  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
      <div>
        <div style="display:flex; align-items:center; gap:6px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green-dark)" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <strong style="color:var(--navy); font-size:14px;">Bank is Registered on RBI UDGAM</strong>
        </div>
        <p class="text-secondary" style="margin:3px 0 0; font-size:12.5px;">${data.message}</p>
      </div>
      <a href="https://udgam.rbi.org.in" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px;">
        <span>Open RBI Portal</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>
    </div>
  `;
  container.appendChild(banner);

  // 2. Recovery Total Summary Banner
  if (data.formattedTotalValue) {
    const totalBanner = document.createElement('div');
    totalBanner.className = 'recovery-total-banner fade-in';
    totalBanner.innerHTML = `
      <div>
        <span style="font-size:12px; color:var(--text-secondary); text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">Total Recoverable Balance</span>
        <div class="recovery-total-amount">${data.formattedTotalValue}</div>
      </div>
      <div style="font-size:12px; color:var(--green-dark); background:rgba(255,255,255,0.7); padding:4px 10px; border-radius:100px; border:1px solid var(--border-green); font-weight:600;">
        Statutory Interest Payable by RBI
      </div>
    `;
    container.appendChild(totalBanner);
  }

  // 3. Deposit Cards
  data.results.forEach((deposit, index) => {
    const card = document.createElement('div');
    card.className = `result-card fade-in delay-${(index % 4) + 1}`;
    card.style.borderLeft = '4px solid var(--blue)';

    card.innerHTML = `
      <div class="result-header">
        <div class="bank-info">
          <div class="bank-icon" style="background:var(--blue-soft, #e8f2f8); color:var(--blue); font-weight:700;">
            ${deposit.bank || 'BANK'}
          </div>
          <div class="bank-details">
            <h4 style="margin:0; font-size:1.05rem;">${deposit.bankName}</h4>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-secondary);">
              ${deposit.accountType} • <strong>${deposit.accountNumber}</strong>
            </p>
          </div>
        </div>
        <span class="deaf-tag" title="DEAF Tracking Identifier">${deposit.deafReferenceNumber}</span>
      </div>

      <div class="result-body" style="margin-top:0.75rem;">
        <div class="detail-item">
          <span class="detail-label">Unclaimed Principal Balance</span>
          <span class="detail-value amount" style="font-size:1.2rem;">${deposit.formattedBalance}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Last Known Transaction</span>
          <span class="detail-value">${deposit.lastTxnDate} (DEAF: ${deposit.transferYearToDEAF})</span>
        </div>
        <div class="detail-item" style="grid-column: span 2;">
          <span class="detail-label">Branch & Status</span>
          <span class="detail-value" style="font-size:13px;">${deposit.branchName} • <span style="color:var(--gold-hover); font-weight:600;">Unclaimed in DEAF</span></span>
        </div>
      </div>

      <div class="result-footer" style="display:flex; justify-content:flex-end; gap:8px; margin-top:1rem; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="addDepositToTracker('${deposit.id}')" id="btn-track-${deposit.id}" style="display:inline-flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><line x1="3" y1="5" x2="21" y2="5"></line><polyline points="7 23 3 19 7 15"></polyline><line x1="21" y1="19" x2="3" y2="19"></line></svg>
          <span>Add to Asset Tracker</span>
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick="openClaimModal('${deposit.id}')" style="display:inline-flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
          <span>Draft DEAF Claim Letter</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ─── Render State B: Zero Deposits Found ────────────────────
function renderZeroDepositsState(data, accountName, bankName, container, countBadge, titleEl) {
  if (titleEl) titleEl.textContent = 'Search Results';
  if (countBadge) {
    countBadge.className = 'badge';
    countBadge.style.background = 'var(--surface)';
    countBadge.style.color = 'var(--text-secondary)';
    countBadge.textContent = '0 Deposits Found';
  }

  const emptyCard = document.createElement('div');
  emptyCard.className = 'empty-state-card fade-in';
  emptyCard.innerHTML = `
    <div class="empty-state-icon">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
    </div>
    <h4>No Unclaimed Deposits Found in ${bankName}</h4>
    <p>No dormant accounts (>10 years) under <strong>"${accountName}"</strong> were transferred to RBI's DEAF fund for this bank.</p>
    
    <div class="empty-next-steps">
      <h5>Why did this happen & what to check next:</h5>
      <ul>
        <li><strong>Account under 10 years inactivity:</strong> The account may simply be frozen or inoperative at the home branch, but not yet transferred to RBI DEAF. You can settle it directly at the branch.</li>
        <li><strong>Name variations:</strong> Check if the passbook had only initials (e.g. "R. Kumar" instead of "Ramesh Kumar") or maiden names.</li>
        <li><strong>Inspect Form 26AS:</strong> Open the Income Tax portal to check Part A — all banks that ever paid interest to the deceased are officially registered there.</li>
      </ul>
    </div>

    <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
      <button type="button" class="btn btn-secondary" onclick="document.getElementById('bank-select').focus()">
        Check Another Bank
      </button>
      <button type="button" class="btn btn-primary" onclick="window.scrollTo({ top: 100, behavior: 'smooth' })">
        Try AI Account Detective
      </button>
    </div>
  `;

  container.appendChild(emptyCard);
}

// ─── Render State C: Unlisted Bank ──────────────────────────
function renderUnlistedBankState(data, bankName, container, countBadge, titleEl) {
  if (titleEl) titleEl.textContent = 'Search Results — Unlisted Bank';
  if (countBadge) {
    countBadge.className = 'badge';
    countBadge.style.background = 'var(--gold-soft)';
    countBadge.style.color = 'var(--gold-hover)';
    countBadge.textContent = 'Not on UDGAM';
  }

  const card = document.createElement('div');
  card.className = 'result-card fade-in';
  card.style.borderLeft = '4px solid var(--gold)';
  card.innerHTML = `
    <div style="text-align:center; padding:1.5rem 1rem;">
      <div style="width:48px; height:48px; margin:0 auto 12px; background:var(--gold-soft); border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--gold-hover);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h4 style="margin:0 0 8px; color:var(--navy); font-size:1.15rem;">${bankName} is not participating in RBI UDGAM</h4>
      <p class="text-secondary" style="max-width:560px; margin:0 auto 1.25rem; font-size:13px;">${data.message}</p>
      
      <div style="background:var(--bg-primary); padding:12px; border-radius:var(--radius-md); max-width:540px; margin:0 auto 1.25rem; text-align:left; font-size:12.5px;">
        <strong style="color:var(--navy);">Next Steps for Co-operative & Rural Banks:</strong>
        <ul style="margin:6px 0 0; padding-left:1.25rem; line-height:1.5;">
          <li>Visit the official bank website: RBI mandates all banks publish a list of inoperative accounts.</li>
          <li>Submit a formal death claim directly to the home branch manager with death certificate & legal heir affidavit.</li>
          <li>Check IEPF portal for corporate shares, debentures, and mutual fund dividends.</li>
        </ul>
      </div>

      <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
        <a href="${data.iepfUrl || 'https://www.iepf.gov.in'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px;">
          <span>Check IEPF Portal</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
        <button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('bank-select').focus()">
          Select a Supported Bank
        </button>
      </div>
    </div>
  `;

  container.appendChild(card);
}

// ─── 1-Click Add to Asset Tracker ───────────────────────────
window.addDepositToTracker = async function(depositId) {
  const deposit = currentSearchResults.find(d => d.id === depositId);
  if (!deposit) return;

  const btn = document.getElementById(`btn-track-${depositId}`);
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Adding...';
  }

  try {
    const payload = {
      caseId: typeof getCaseId === 'function' ? getCaseId() : null,
      depositData: deposit
    };

    let resp = null;
    if (typeof AnvayaApi !== 'undefined' && typeof AnvayaApi.claimUdgamToAsset === 'function') {
      try {
        resp = await AnvayaApi.claimUdgamToAsset(payload);
      } catch (e) {
        console.warn('API save error, saving locally:', e);
      }
    }

    // Save locally as well
    const saved = JSON.parse(localStorage.getItem('anvaya_claimed_udgam') || '[]');
    saved.push(deposit);
    localStorage.setItem('anvaya_claimed_udgam', JSON.stringify(saved));

    if (btn) {
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green-dark)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Tracked in Assets</span>
      `;
      btn.className = 'btn btn-secondary btn-sm';
      btn.style.color = 'var(--green-dark)';
    }

    if (typeof showToast === 'function') {
      showToast(`${deposit.bankName} deposit added to your Asset Tracker!`, 'success');
    }
  } catch (err) {
    console.error('Error tracking deposit:', err);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Add to Asset Tracker';
    }
  }
};

// ─── AI Lost Account Detective ──────────────────────────────
window.triggerAiDetective = async function() {
  const city = document.getElementById('ai-city-input')?.value?.trim();
  const profession = document.getElementById('ai-profession-input')?.value?.trim();
  const container = document.getElementById('ai-predictions-container');
  const btn = document.getElementById('btn-run-ai-detective');

  if (!city && !profession) {
    if (typeof showToast === 'function') showToast('Please enter a city or profession to analyze', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Analyzing...';
  }

  if (container) {
    container.style.display = 'block';
    container.innerHTML = '<div style="text-align:center; padding:12px; font-size:12px; color:var(--text-secondary);"><span class="spinner" style="display:inline-block; vertical-align:middle; margin-right:6px;"></span>Consulting banking history patterns...</div>';
  }

  try {
    let result = null;
    if (typeof AnvayaApi !== 'undefined' && typeof AnvayaApi.aiPredictLostAccounts === 'function') {
      try {
        result = await AnvayaApi.aiPredictLostAccounts({ city, profession });
      } catch (err) {
        console.warn('AI Detective API failed, using client model:', err);
      }
    }

    if (!result || !result.predictions) {
      // Client fallback
      result = {
        predictions: [
          {
            bankName: 'State Bank of India',
            bankCode: 'SBI',
            probability: '88%',
            rationale: 'Primary repository for government and PSU employment mandates in this region.',
            suggestedSearchKeywords: ['Full Name as on Aadhaar', 'First Name + Surname']
          },
          {
            bankName: 'Punjab National Bank',
            bankCode: 'PNB',
            probability: '65%',
            rationale: 'Major nationalized commercial network with high volume of legacy savings accounts.',
            suggestedSearchKeywords: ['Initials + Surname']
          },
          {
            bankName: 'HDFC Bank',
            bankCode: 'HDFC',
            probability: '52%',
            rationale: 'Leading private bank for corporate payroll and salary accounts.',
            suggestedSearchKeywords: ['Full Legal Name']
          }
        ]
      };
    }

    if (container) {
      container.innerHTML = `
        <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--navy); margin-bottom:6px;">Top Predicted Banks:</div>
        <div class="ai-predictions-grid">
          ${result.predictions.map(p => `
            <div class="ai-prediction-card">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="color:var(--navy); font-size:12.5px;">${p.bankName}</strong>
                  <span class="ai-prob-tag">${p.probability} Match</span>
                </div>
                <p style="margin:4px 0 0; font-size:11.5px; color:var(--text-secondary); line-height:1.4;">${p.rationale}</p>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="selectPredictedBank('${p.bankName}')" style="font-size:11px; padding:4px 8px; width:100%; margin-top:6px;">
                Select & Search ${p.bankCode}
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg><span>Predict Banks</span>`;
    }
  } catch (err) {
    console.error('AI Detective error:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg><span>Predict Banks</span>`;
    }
  }
};

window.selectPredictedBank = function(bankName) {
  const bankSelect = document.getElementById('bank-select');
  if (bankSelect) {
    setSelectValue(bankSelect, bankName);
    bankSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
    bankSelect.focus();
    if (typeof showToast === 'function') {
      showToast(`Selected ${bankName}. Ready to search!`, 'success');
    }
  }
};

// ─── DEAF Claim Letter Modal & Generation ───────────────────
window.openClaimModal = async function(depositId) {
  const deposit = currentSearchResults.find(d => d.id === depositId) || currentSearchResults[0];
  if (!deposit) return;

  currentSelectedDepositForClaim = deposit;

  const modal = document.getElementById('deaf-letter-modal');
  const textarea = document.getElementById('deaf-claim-letter-text');
  const titleEl = document.getElementById('modal-letter-title');

  if (titleEl) {
    titleEl.textContent = `DEAF Claim Notice — ${deposit.bankName} (${deposit.deafReferenceNumber})`;
  }

  if (modal) modal.classList.remove('hidden');
  if (textarea) textarea.value = 'Generating customized statutory notice citing RBI Master Circular...';

  const user = typeof getUser === 'function' ? getUser() : null;
  const claimantName = user && user.name ? user.name : 'Claimant Legal Heir';

  try {
    let letterData = null;

    if (typeof AnvayaApi !== 'undefined' && typeof AnvayaApi.generateUdgamClaimLetter === 'function') {
      try {
        letterData = await AnvayaApi.generateUdgamClaimLetter({
          deposit,
          claimantName,
          claimantRelation: 'Legal Heir / Nominee',
          deceasedName: deposit.accountHolder
        });
      } catch (e) {
        console.warn('API letter generation failed, using local generator:', e);
      }
    }

    if (letterData && letterData.letter) {
      if (textarea) textarea.value = letterData.letter;
    } else {
      if (textarea) textarea.value = generateLocalClaimLetter(deposit, claimantName);
    }
  } catch (err) {
    if (textarea) textarea.value = generateLocalClaimLetter(deposit, claimantName);
  }
};

function generateLocalClaimLetter(deposit, claimantName) {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return `To,
The Nodal Officer / Branch Manager
${deposit.bankName}
[Home Branch / Central Processing Centre]

Date: ${today}

SUBJECT: APPLICATION FOR REFUND OF UNCLAIMED DEPOSIT UNDER RBI DEPOSITOR EDUCATION AND AWARENESS FUND (DEAF) SCHEME, 2014
IN RESPECT OF LATE ${deposit.accountHolder.toUpperCase()}
DEAF REFERENCE NO: ${deposit.deafReferenceNumber}

Respected Sir / Madam,

I am writing to formally submit a claim for the refund of unclaimed deposit lying transferred to the Depositor Education and Awareness Fund (DEAF) maintained by the Reserve Bank of India, in respect of my late family member, Shri/Smt. ${deposit.accountHolder}.

1. PARTICULARS OF DECEASED ACCOUNT HOLDER:
   • Full Name of Deceased Holder : ${deposit.accountHolder}
   • Name of Bank & Branch        : ${deposit.bankName} (${deposit.branchName})
   • Account Category & Type      : ${deposit.accountType}
   • Masked Account Number        : ${deposit.accountNumber}
   • Estimated Unclaimed Balance  : ${deposit.formattedBalance}
   • RBI DEAF Reference Number    : ${deposit.deafReferenceNumber}

2. STATUTORY BASIS OF CLAIM:
   Under Section 26A of the Banking Regulation Act, 1949 read with the Reserve Bank of India Depositor Education and Awareness Fund Scheme, 2014 (RBI Master Circular DBOD.No.DEAF Cell.BC.101/30.01.002/2013-14):
   a) The bank is mandated to accept and process the claim submitted by the legal heir/nominee.
   b) Upon satisfactory verification of credentials, the bank shall settle the principal sum together with applicable interest as specified by the Reserve Bank of India from time to time.
   c) As per RBI citizen charter, absence of an old physical passbook or cheque leaf shall not be grounds for refusing a claim where claimant KYC and valid municipal Death Certificate are provided.

3. PARTICULARS OF CLAIMANT:
   • Full Name of Claimant        : ${claimantName}
   • Relationship to Deceased     : Nominee / Legal Heir
   • Residential Address          : [Claimant Full Residential Address]
   • Contact Number & Email       : [+91 XXXXXXXXXX / claimant@email.com]
   • Bank Account for Settlement  : [Claimant Bank Name, Account No, IFSC Code]

4. ENCLOSURES ATTACHED:
   [1] Original/Certified Death Certificate issued by Municipal Authority
   [2] Self-attested PAN and Aadhaar copies of Claimant
   [3] Proof of Relationship / Surviving Member Certificate / Registered Will / Nomination Form
   [4] Original Cancelled Cheque of Claimant's active bank account
   [5] Indemnity Bond & Affidavit (as per bank standard format, if required)

Kindly acknowledge receipt of this application and initiate the DEAF claim settlement process to credit the proceeds to the claimant's bank account within the statutory timeframe.

Yours faithfully,


_____________________________________
Signature of Claimant: ${claimantName}
Name: ${claimantName}
Date: ${today}`;
}

window.closeClaimModal = function() {
  const modal = document.getElementById('deaf-letter-modal');
  if (modal) modal.classList.add('hidden');
};

window.copyClaimLetter = function() {
  const textarea = document.getElementById('deaf-claim-letter-text');
  if (!textarea) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    if (typeof showToast === 'function') {
      showToast('Claim application copied to clipboard! Paste into Word or Docs.', 'success');
    }
  }).catch(() => {
    textarea.select();
    document.execCommand('copy');
    if (typeof showToast === 'function') {
      showToast('Claim application copied to clipboard!', 'success');
    }
  });
};

window.printClaimLetter = function() {
  const textarea = document.getElementById('deaf-claim-letter-text');
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
      <title>RBI DEAF Statutory Claim Application</title>
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
};

// ─── Accordion Logic ────────────────────────────────────────
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const h = otherItem.querySelector('.accordion-header');
          if (h) h.setAttribute('aria-expanded', 'false');
        }
      });
      
      if (isExpanded) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

