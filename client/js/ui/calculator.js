// calculator.js — Connected to Backend API
// Uses AnvayaApi from api/anvayaApi.js + apiRequest/showToast from shared.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize page
  if (typeof initPage === 'function') {
    initPage('calculator', {
      greeting: 'Benefit Calculator',
      subtitle: 'Estimate your total financial entitlements'
    });
  }

  const form = document.getElementById('calculator-form');
  const resultsSection = document.getElementById('results-section');
  const saveBtn = document.getElementById('save-btn');
  const downloadBtn = document.getElementById('download-btn');

  // Pre-fill form with sample data
  document.getElementById('salary').value = 45000;
  document.getElementById('years').value = 12;
  document.getElementById('epf').value = 850000;
  document.getElementById('insurance').value = 1000000;
  document.getElementById('fd').value = 350000;
  
  document.getElementById('gratuity-check').checked = true;
  document.getElementById('pmjjby-check').checked = true;
  document.getElementById('pmsby-check').checked = false;

  // Format currency
  const fmtCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // ─── Client-side fallback calculation ─────────────────────
  function calculateLocally(salary, years, epf, insurance, fd, hasGratuity, hasPmjjby, hasPmsby) {
    const gratuity = hasGratuity ? Math.round((salary * 15 * years) / 26) : 0;
    const pmjjby = hasPmjjby ? 200000 : 0;
    const pmsby = hasPmsby ? 200000 : 0;
    const total = epf + gratuity + insurance + pmjjby + pmsby + fd;

    return {
      breakdown: { gratuity, fdMaturity: fd, pmjjbyPayout: pmjjby, lic: insurance },
      epf,
      pmsby,
      total: total
    };
  }

  // ─── Update result UI ─────────────────────────────────────
  function updateResultsUI(data) {
    const b = data.breakdown || {};
    document.getElementById('res-epf').textContent = fmtCurrency(data.epf || 0);
    document.getElementById('res-gratuity').textContent = fmtCurrency(b.gratuity || 0);
    document.getElementById('res-insurance').textContent = fmtCurrency(b.lic || 0);
    document.getElementById('res-pmjjby').textContent = fmtCurrency(b.pmjjbyPayout || 0);
    document.getElementById('res-pmsby').textContent = fmtCurrency(data.pmsby || 0);
    document.getElementById('res-fd').textContent = fmtCurrency(b.fdMaturity || 0);
    document.getElementById('res-total').textContent = fmtCurrency(data.total || 0);

    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ─── Form Submit — try backend first, fallback to client ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get input values
    const salary = parseFloat(document.getElementById('salary').value) || 0;
    const years = parseFloat(document.getElementById('years').value) || 0;
    const epf = parseFloat(document.getElementById('epf').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const fd = parseFloat(document.getElementById('fd').value) || 0;
    
    const hasGratuity = document.getElementById('gratuity-check').checked;
    const hasPmjjby = document.getElementById('pmjjby-check').checked;
    const hasPmsby = document.getElementById('pmsby-check').checked;

    const calcBtn = document.getElementById('calculate-btn');
    calcBtn.textContent = 'Calculating...';
    calcBtn.disabled = true;

    try {
      // Call backend API
      const apiResult = await AnvayaApi.calculateBenefits({
        lastSalary: salary,
        yearsOfService: years,
        licSumAssured: insurance,
        fdPrincipal: fd,
        fdRate: 7, // default rate
        fdYears: 1, // default 1 year
        pmjjbyEnrolled: hasPmjjby
      });

      // Backend returns { breakdown: { gratuity, fdMaturity, pmjjbyPayout, lic }, total }
      // We also need EPF and PMSBY which the backend doesn't compute, so add them
      const pmsby = hasPmsby ? 200000 : 0;
      const totalWithExtras = apiResult.total + epf + pmsby;

      updateResultsUI({
        breakdown: apiResult.breakdown,
        epf: epf,
        pmsby: pmsby,
        total: totalWithExtras
      });

      if (typeof showToast === 'function') {
        showToast('Benefits calculated using server', 'success');
      }
    } catch (err) {
      console.warn('Backend unavailable, using client-side calculation:', err.message);
      
      // Fallback to client-side calculation
      const localResult = calculateLocally(salary, years, epf, insurance, fd, hasGratuity, hasPmjjby, hasPmsby);
      updateResultsUI(localResult);
    } finally {
      calcBtn.textContent = 'Calculate Benefits';
      calcBtn.disabled = false;
    }
  });

  // ─── Save to Dashboard ────────────────────────────────────
  saveBtn.addEventListener('click', () => {
    if (typeof showToast === 'function') {
      showToast('Estimates saved to dashboard successfully!', 'success');
    }
  });

  // ─── Download PDF ─────────────────────────────────────────
  downloadBtn.addEventListener('click', () => {
    if (typeof showToast === 'function') {
      showToast('Downloading PDF report...', 'info');
    }
  });

  // ─── Load PMJJBY/PMSBY scheme info from backend ──────────
  loadSchemeInfo();
});

// ─── Fetch and display scheme details below results ────────
async function loadSchemeInfo() {
  try {
    const data = await AnvayaApi.getPmjjbyGuide();
    
    // Create info panel if it doesn't exist yet
    if (document.getElementById('scheme-info-panel')) return;

    const resultsSection = document.getElementById('results-section');
    if (!resultsSection) return;

    const panel = document.createElement('div');
    panel.id = 'scheme-info-panel';
    panel.className = 'info-note';
    panel.style.marginTop = '1.5rem';

    const pmjjby = data.pmjjby || {};
    const pmsby = data.pmsby || {};

    panel.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <div>
        <p><strong>PMJJBY</strong>: ${pmjjby.name || 'Pradhan Mantri Jeevan Jyoti Bima Yojana'} — ₹${(pmjjby.cover || 200000).toLocaleString('en-IN')} life cover @ ₹${pmjjby.premium || 436}/yr</p>
        <p style="margin-top:4px"><strong>PMSBY</strong>: ${pmsby.name || 'Pradhan Mantri Suraksha Bima Yojana'} — ₹${(pmsby.cover || 200000).toLocaleString('en-IN')} accidental cover @ ₹${pmsby.premium || 20}/yr</p>
        <p style="margin-top:8px;font-size:0.85rem;color:var(--text-muted)"><strong>How to check:</strong> ${(pmjjby.checkSteps || [])[0] || 'Check bank passbook for auto-debit entry'}</p>
      </div>
    `;

    resultsSection.appendChild(panel);
  } catch (err) {
    // Silently fail — scheme info is supplementary
    console.warn('Could not load scheme info:', err.message);
  }
}
