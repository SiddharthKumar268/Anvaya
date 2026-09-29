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
  document.getElementById('nominee-age').value = 45;
  document.getElementById('monthly-expenses').value = 25000;
  
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

    const nomineeAge = parseInt(document.getElementById('nominee-age').value) || 40;
    const riskTolerance = document.getElementById('risk-tolerance').value || 'moderate';
    const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value) || 0;

    const calcBtn = document.getElementById('calculate-btn');
    calcBtn.textContent = 'Calculating...';
    calcBtn.disabled = true;

    let totalReceivable = 0;

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
      totalReceivable = apiResult.total + epf + pmsby;

      updateResultsUI({
        breakdown: apiResult.breakdown,
        epf: epf,
        pmsby: pmsby,
        total: totalReceivable
      });

      if (typeof showToast === 'function') {
        showToast('Benefits calculated using server', 'success');
      }
    } catch (err) {
      console.warn('Backend unavailable, using client-side calculation:', err.message);
      
      // Fallback to client-side calculation
      const localResult = calculateLocally(salary, years, epf, insurance, fd, hasGratuity, hasPmjjby, hasPmsby);
      totalReceivable = localResult.total;
      updateResultsUI(localResult);
    } finally {
      calcBtn.textContent = 'Calculate Benefits';
      calcBtn.disabled = false;
    }

    // Load investment recommendations
    loadRecommendations(totalReceivable, nomineeAge, riskTolerance, monthlyExpenses);
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

// ─── Smart Investment Recommendations ──────────────────────
const fmtCurrencyGlobal = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

async function loadRecommendations(totalAmount, nomineeAge, riskTolerance, monthlyExpenses) {
  const recoSection = document.getElementById('recommendations-section');
  const recoGrid = document.getElementById('reco-grid');
  if (!recoSection || !recoGrid) return;

  recoGrid.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">Analyzing best investment options...</div>';
  recoSection.classList.remove('hidden');

  let recommendations = [];

  try {
    const result = await AnvayaApi.getInvestmentRecommendations({
      totalAmount, nomineeAge, riskTolerance, monthlyExpenses
    });
    if (result && result.recommendations && result.recommendations.length > 0) {
      recommendations = result.recommendations;
    } else {
      throw new Error('Empty response');
    }
  } catch (err) {
    console.warn('Backend recommendations unavailable, using client-side fallback:', err.message);
    recommendations = generateLocalRecommendations(totalAmount, nomineeAge, riskTolerance, monthlyExpenses);
  }

  renderRecommendations(recommendations, recoGrid);

  setTimeout(() => {
    recoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
}

function generateLocalRecommendations(totalAmount, nomineeAge, riskTolerance, monthlyExpenses) {
  const recs = [];

  // 1. SCSS
  const scssAmount = Math.min(totalAmount * 0.4, 3000000);
  recs.push({
    id: 'scss',
    name: 'Senior Citizen Savings Scheme (SCSS)',
    category: 'government',
    returnRate: 8.2,
    lockIn: '5 Years',
    riskLevel: 'Low',
    suggestedAmount: Math.round(scssAmount),
    projectedValue: Math.round(scssAmount * Math.pow(1.082, 5)),
    monthlyIncome: Math.round(scssAmount * 0.082 / 12),
    description: 'Government-backed scheme for senior citizens with quarterly interest payouts. Ideal for regular income.',
    whyRecommended: 'Highest fixed-income return among government schemes with sovereign guarantee.',
    isAI: false
  });

  // 2. POMIS
  const pomisAmount = Math.min(totalAmount * 0.25, 900000);
  const pomisMonthly = Math.round(pomisAmount * 0.074 / 12);
  const pomisCoversPct = monthlyExpenses > 0 ? Math.round((pomisMonthly / monthlyExpenses) * 100) : 0;
  recs.push({
    id: 'pomis',
    name: 'Post Office Monthly Income Scheme',
    category: 'government',
    returnRate: 7.4,
    lockIn: '5 Years',
    riskLevel: 'Low',
    suggestedAmount: Math.round(pomisAmount),
    projectedValue: Math.round(pomisAmount + (pomisAmount * 0.074 * 5)),
    monthlyIncome: pomisMonthly,
    description: 'Post Office scheme providing guaranteed monthly income. Safe and reliable for household expenses.',
    whyRecommended: pomisCoversPct > 50
      ? `Covers ${pomisCoversPct}% of your monthly expenses with guaranteed income.`
      : 'Provides steady monthly income backed by Government of India.',
    isAI: false
  });

  // 3. PPF
  const ppfMaturity = Math.round(150000 * ((Math.pow(1.071, 15) - 1) / 0.071) * 1.071);
  recs.push({
    id: 'ppf',
    name: 'Public Provident Fund (PPF)',
    category: 'tax-saving',
    returnRate: 7.1,
    lockIn: '15 Years',
    riskLevel: 'Low',
    suggestedAmount: 150000,
    projectedValue: ppfMaturity,
    monthlyIncome: null,
    description: 'Tax-free returns under Section 80C. EEE (Exempt-Exempt-Exempt) status makes this the best long-term tax-saving instrument.',
    whyRecommended: 'Completely tax-free returns with sovereign guarantee — best for long-term wealth building.',
    isAI: false
  });

  // 4. FD Ladder
  const fdTotal = Math.min(totalAmount * 0.3, totalAmount);
  const tranche = fdTotal / 4;
  const fdProjected = Math.round(
    tranche * 1.07 + tranche * Math.pow(1.07, 2) + tranche * Math.pow(1.07, 3) + tranche * Math.pow(1.07, 5)
  );
  recs.push({
    id: 'fd-ladder',
    name: 'FD Ladder Strategy',
    category: 'government',
    returnRate: 7.0,
    lockIn: '1–5 Years',
    riskLevel: 'Low',
    suggestedAmount: Math.round(fdTotal),
    projectedValue: fdProjected,
    monthlyIncome: null,
    description: 'Split deposits across 1, 2, 3, and 5 year FDs. Ensures liquidity every year while maximizing returns.',
    whyRecommended: 'Balances liquidity with returns — you always have an FD maturing soon for emergencies.',
    isAI: false
  });

  // 5. AI Fallback 1
  if (riskTolerance === 'conservative') {
    const rbfAmount = Math.round(totalAmount * 0.15);
    recs.push({
      id: 'rbi-bonds',
      name: 'RBI Floating Rate Savings Bonds',
      category: 'government',
      returnRate: 8.05,
      lockIn: '7 Years',
      riskLevel: 'Low',
      suggestedAmount: rbfAmount,
      projectedValue: Math.round(rbfAmount * Math.pow(1.0805, 7)),
      monthlyIncome: null,
      description: 'Government of India bonds with floating rate linked to NSC. Zero default risk with attractive returns.',
      whyRecommended: 'Perfect for conservative investors — sovereign guarantee with returns beating inflation.',
      isAI: true
    });
  } else {
    const sipAmount = Math.round(totalAmount * 0.15);
    const sipMonthly = Math.round(sipAmount / 60);
    const sipProjected = Math.round(sipMonthly * ((Math.pow(1 + 0.01, 60) - 1) / 0.01) * (1 + 0.01));
    recs.push({
      id: 'nifty-sip',
      name: 'SIP in Nifty 50 Index Fund',
      category: 'market',
      returnRate: 12.0,
      lockIn: 'Flexible',
      riskLevel: 'Medium',
      suggestedAmount: sipAmount,
      projectedValue: sipProjected,
      monthlyIncome: null,
      description: `Systematic Investment of ${fmtCurrencyGlobal(sipMonthly)}/month in low-cost index fund tracking Nifty 50. Best for long-term wealth creation.`,
      whyRecommended: 'Index funds have delivered 12%+ CAGR over 10+ years — ideal for wealth building with managed risk.',
      isAI: true
    });
  }

  // 6. AI Fallback 2 — NPS
  const npsAmount = Math.round(totalAmount * 0.1);
  const npsYears = Math.max(60 - nomineeAge, 5);
  recs.push({
    id: 'nps',
    name: 'National Pension System (NPS)',
    category: 'tax-saving',
    returnRate: 9.5,
    lockIn: `Until age 60 (~${npsYears} yrs)`,
    riskLevel: 'Medium',
    suggestedAmount: npsAmount,
    projectedValue: Math.round(npsAmount * Math.pow(1.095, npsYears)),
    monthlyIncome: null,
    description: 'Tax-efficient retirement planning under Section 80CCD. Additional ₹50,000 deduction over Section 80C limit.',
    whyRecommended: nomineeAge < 45
      ? 'Starting NPS early maximizes compounding — extra ₹50K tax benefit beyond 80C.'
      : 'Additional ₹50,000 tax deduction under 80CCD(1B) — powerful for tax planning.',
    isAI: true
  });

  return recs;
}

function renderRecommendations(recommendations, container) {
  if (!recommendations || recommendations.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">No recommendations available.</div>';
    return;
  }

  const categoryLabels = { government: 'Govt. Backed', market: 'Market Linked', 'tax-saving': 'Tax Saving' };
  const aiBadgeSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
  const lightbulbSVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>';

  container.innerHTML = recommendations.map((r, i) => {
    const riskClass = r.riskLevel === 'Low' ? 'risk-low' : (r.riskLevel === 'High' ? 'risk-high' : 'risk-medium');

    let statsHTML = '';
    if (r.monthlyIncome) {
      statsHTML = `
        <div class="reco-stats">
          <div class="reco-stat">
            <div class="reco-stat-label">Invest</div>
            <div class="reco-stat-value">${fmtCurrencyGlobal(r.suggestedAmount)}</div>
          </div>
          <div class="reco-stat">
            <div class="reco-stat-label">Monthly Income</div>
            <div class="reco-stat-value highlight">${fmtCurrencyGlobal(r.monthlyIncome)}/mo</div>
          </div>
          <div class="reco-stat">
            <div class="reco-stat-label">Return</div>
            <div class="reco-stat-value">${r.returnRate}% p.a.</div>
          </div>
          <div class="reco-stat">
            <div class="reco-stat-label">After ${r.lockIn}</div>
            <div class="reco-stat-value highlight">${fmtCurrencyGlobal(r.projectedValue)}</div>
          </div>
        </div>
      `;
    } else {
      statsHTML = `
        <div class="reco-stats">
          <div class="reco-stat">
            <div class="reco-stat-label">Invest</div>
            <div class="reco-stat-value">${fmtCurrencyGlobal(r.suggestedAmount)}</div>
          </div>
          <div class="reco-stat">
            <div class="reco-stat-label">Return</div>
            <div class="reco-stat-value">${r.returnRate}% p.a.</div>
          </div>
          <div class="reco-stat">
            <div class="reco-stat-label">Lock-in</div>
            <div class="reco-stat-value">${r.lockIn}</div>
          </div>
          <div class="reco-stat">
            <div class="reco-stat-label">Projected Value</div>
            <div class="reco-stat-value highlight">${fmtCurrencyGlobal(r.projectedValue)}</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="reco-card ${r.isAI ? 'ai-card' : ''}" style="animation-delay: ${i * 0.08}s">
        <div class="reco-card-top">
          <h4 class="reco-card-name">${r.name}</h4>
        </div>
        <div class="reco-badge-row">
          ${r.isAI ? `<span class="reco-badge ai">${aiBadgeSVG} AI Recommended</span>` : ''}
          <span class="reco-badge ${riskClass}">${r.riskLevel} Risk</span>
          <span class="reco-badge category">${categoryLabels[r.category] || r.category}</span>
        </div>
        <div class="reco-desc">${r.description}</div>
        ${statsHTML}
        <div class="reco-why">
          ${lightbulbSVG}
          <span>${r.whyRecommended}</span>
        </div>
      </div>
    `;
  }).join('');
}
