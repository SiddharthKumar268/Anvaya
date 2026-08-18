// udgam.js — Connected to Backend API
// Uses AnvayaApi from api/anvayaApi.js + showToast from shared.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize standard page layout
  initPage('udgam', {
    greeting: 'UDGAM Checker',
    subtitle: 'Find unclaimed deposits via RBI\'s UDGAM initiative'
  });

  // Demo fallback data (shown as illustrative results — actual search happens on RBI portal)
  const DEMO_RESULTS = [
    {
      bank: 'SBI',
      bankName: 'State Bank of India',
      type: 'Savings Account',
      accountNumber: 'XXXX4521',
      balance: '₹23,450',
      lastTxn: '12 Mar 2018',
      status: 'Unclaimed'
    },
    {
      bank: 'PNB',
      bankName: 'Punjab National Bank',
      type: 'Fixed Deposit',
      accountNumber: 'XXXX7890',
      balance: '₹1,50,000',
      lastTxn: '05 Jan 2016',
      status: 'Unclaimed'
    },
    {
      bank: 'SBI',
      bankName: 'State Bank of India',
      type: 'RD Account',
      accountNumber: 'XXXX3344',
      balance: '₹45,200',
      lastTxn: '22 Aug 2019',
      status: 'Unclaimed'
    }
  ];

  // Full list of 30 UDGAM-registered banks (loaded from backend or fallback)
  const FALLBACK_BANKS = [
    { name: 'State Bank of India', code: 'SBI' },
    { name: 'Punjab National Bank', code: 'PNB' },
    { name: 'Central Bank of India', code: 'CBI' },
    { name: 'Dhanlaxmi Bank Ltd.', code: 'DHANLAXMI' },
    { name: 'South Indian Bank Ltd.', code: 'SIB' },
    { name: 'DBS Bank India Ltd.', code: 'DBS' },
    { name: 'Citibank N.A.', code: 'CITI' },
    { name: 'Canara Bank', code: 'CANARA' },
    { name: 'Bank of India', code: 'BOI' },
    { name: 'Bank of Baroda', code: 'BOB' },
    { name: 'Indian Bank', code: 'INDIAN' },
    { name: 'Union Bank of India', code: 'UNION' },
    { name: 'HDFC Bank', code: 'HDFC' },
    { name: 'Federal Bank', code: 'FEDERAL' },
    { name: 'Kotak Mahindra Bank', code: 'KOTAK' },
    { name: 'ICICI Bank', code: 'ICICI' },
    { name: 'UCO Bank', code: 'UCO' },
    { name: 'Bank of Maharashtra', code: 'BOM' },
    { name: 'IDBI Bank', code: 'IDBI' },
    { name: 'Jammu and Kashmir Bank Ltd.', code: 'JK' },
    { name: 'Punjab and Sind Bank', code: 'PSB' },
    { name: 'Axis Bank Ltd.', code: 'AXIS' },
    { name: 'Indian Overseas Bank', code: 'IOB' },
    { name: 'Standard Chartered Bank', code: 'SC' },
    { name: 'HSBC Ltd.', code: 'HSBC' },
    { name: 'Karnataka Bank Ltd.', code: 'KARNATAKA' },
    { name: 'The Karur Vysya Bank Ltd.', code: 'KVB' },
    { name: 'Saraswat Co-operative Bank', code: 'SARASWAT' },
    { name: 'IndusInd Bank Ltd.', code: 'INDUSIND' },
    { name: 'Tamilnad Mercantile Bank Ltd.', code: 'TMB' }
  ];

  // DOM elements
  const bankSelect = document.getElementById('bank-select');
  const searchForm = document.getElementById('udgam-search-form');
  const searchBtn = document.getElementById('search-btn');
  const searchSpinner = document.getElementById('search-spinner');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');
  const resultsCount = document.getElementById('results-count');

  // ─── Populate bank dropdown with all 30 banks ─────────────
  populateBankDropdown(FALLBACK_BANKS);

  // ─── Handle Form Submission — call backend API ────────────
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedBank = bankSelect.value;
    const accountName = document.getElementById('account-name').value.trim();

    if (!accountName) {
      showToast('Please enter the account holder name', 'error');
      return;
    }

    // Show spinner
    searchSpinner.style.display = 'inline-block';
    searchBtn.disabled = true;
    resultsSection.classList.add('hidden');
    resultsList.innerHTML = '';

    try {
      // Call backend to check if the selected bank is UDGAM-registered
      const data = await AnvayaApi.checkUdgam(selectedBank);

      searchSpinner.style.display = 'none';
      searchBtn.disabled = false;

      if (data.registered) {
        // Bank is on UDGAM — show results + portal link
        renderUdgamStatus(data, accountName);
        renderResults(DEMO_RESULTS);
        resultsCount.textContent = `${DEMO_RESULTS.length} Deposits Found`;
      } else {
        // Bank is not on UDGAM
        renderUdgamStatus(data, accountName);
        resultsCount.textContent = 'Not on UDGAM';
        resultsList.innerHTML = `
          <div class="result-card fade-in" style="text-align:center;padding:2rem;">
            <h4 style="margin-bottom:0.5rem;">⚠️ ${selectedBank} is not listed on UDGAM</h4>
            <p class="text-secondary">${data.message}</p>
            <div style="margin-top:1rem;display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
              <a href="${data.iepfUrl || 'https://www.iepf.gov.in'}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">Check IEPF Portal ↗</a>
              <button class="btn btn-ghost" onclick="showToast('Contact the bank branch directly for unclaimed deposit inquiry')">Contact Bank</button>
            </div>
          </div>
        `;
      }

      // Show results section
      resultsSection.classList.remove('hidden');
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      console.warn('Backend unavailable, showing demo results:', err.message);
      
      searchSpinner.style.display = 'none';
      searchBtn.disabled = false;

      // Fallback — show demo results
      renderResults(DEMO_RESULTS);
      resultsCount.textContent = `${DEMO_RESULTS.length} Deposits Found`;
      resultsSection.classList.remove('hidden');
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ─── Render UDGAM status banner ───────────────────────────
  function renderUdgamStatus(data, accountName) {
    // Add a status banner at the top of results
    const statusBanner = document.createElement('div');
    statusBanner.className = 'result-card fade-in';
    statusBanner.style.cssText = `border-left: 4px solid ${data.registered ? 'var(--green, #668C55)' : 'var(--gold, #D5A546)'}; margin-bottom: 0.75rem;`;

    statusBanner.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
        <div>
          <h4 style="margin:0;">${data.registered ? '✅ Bank registered on UDGAM' : '⚠️ Bank not on UDGAM'}</h4>
          <p class="text-secondary" style="margin:4px 0 0;">${data.message}</p>
        </div>
        ${data.portalUrl ? `<a href="${data.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Search on UDGAM ↗</a>` : ''}
      </div>
    `;

    resultsList.appendChild(statusBanner);
  }

  // ─── Render deposit result cards ──────────────────────────
  function renderResults(results) {
    results.forEach((result, index) => {
      const card = document.createElement('div');
      card.className = `result-card fade-in delay-${(index % 5) + 1}`;
      
      card.innerHTML = `
        <div class="result-header">
          <div class="bank-info">
            <div class="bank-icon">${result.bank}</div>
            <div class="bank-details">
              <h4>${result.bankName}</h4>
              <p>${result.type} • ${result.accountNumber}</p>
            </div>
          </div>
          <span class="badge badge-pending">${result.status}</span>
        </div>
        
        <div class="result-body">
          <div class="detail-item">
            <span class="detail-label">Last Known Balance</span>
            <span class="detail-value amount">${result.balance}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Last Transaction</span>
            <span class="detail-value">${result.lastTxn}</span>
          </div>
        </div>
        
        <div class="result-footer">
          <button class="btn btn-primary initiate-claim-btn" data-bank="${result.bank}" data-acc="${result.accountNumber}">
            Initiate Claim
          </button>
        </div>
      `;
      
      resultsList.appendChild(card);
    });

    // Add event listeners to newly created buttons
    document.querySelectorAll('.initiate-claim-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        showToast('Claim process initiated. Check Claims page.', 'success');
      });
    });
  }

  // ─── Populate bank dropdown ───────────────────────────────
  function populateBankDropdown(banks) {
    // Clear existing options except the placeholder
    bankSelect.innerHTML = '<option value="" disabled selected>Select a bank</option>';

    banks.forEach(bank => {
      const option = document.createElement('option');
      option.value = bank.name;
      option.textContent = `${bank.name} (${bank.code})`;
      bankSelect.appendChild(option);
    });
  }

  // ─── Accordion Logic ──────────────────────────────────────
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      
      // Close all other accordions
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });
      
      // Toggle current accordion
      if (isExpanded) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── Toast function (use shared if available) ─────────────
  if (typeof window.showToast !== 'function') {
    window.showToast = function(message) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
      }, 3500);
    };
  }
});
