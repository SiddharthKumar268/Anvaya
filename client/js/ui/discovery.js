// Discovery Page Logic — Bank Statement Analyzer
// Uses AnvayaApi from api/anvayaApi.js + apiRequest/showToast from shared.js

// Kind icon SVG paths
const KIND_ICONS = {
  insurance: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  mutualfund: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  liability: `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  demat: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`,
  savings: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>`,
  employer: `<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/>`,
  property: `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`
};

const DEMO_LEADS = [
  { kind: 'insurance', label: 'Life insurance policy', merchant: 'LIC OF INDIA', interval: 'yearly', avgAmount: 24500, count: 3, confidence: 0.9, evidence: [{ date: '2025-03-15', amt: 24500, desc: 'NEFT-LIC OF INDIA-PREMIUM' }, { date: '2024-03-12', amt: 24500, desc: 'NEFT-LIC OF INDIA-PREMIUM' }, { date: '2023-03-18', amt: 24500, desc: 'NEFT-LIC OF INDIA-PREMIUM' }] },
  { kind: 'mutualfund', label: 'Mutual fund folio', merchant: 'BSE STAR SIP', interval: 'monthly', avgAmount: 5000, count: 12, confidence: 1.0, evidence: [{ date: '2025-06-05', amt: 5000, desc: 'NACH-BSE STAR-SIP' }, { date: '2025-05-05', amt: 5000, desc: 'NACH-BSE STAR-SIP' }, { date: '2025-04-05', amt: 5000, desc: 'NACH-BSE STAR-SIP' }] },
  { kind: 'liability', label: 'Loan / EMI', merchant: 'BAJAJ FIN EMI', interval: 'monthly', avgAmount: 8750, count: 8, confidence: 0.82, evidence: [{ date: '2025-06-10', amt: 8750, desc: 'ACH D-BAJAJ FINANCE EMI' }, { date: '2025-05-10', amt: 8750, desc: 'ACH D-BAJAJ FINANCE EMI' }, { date: '2025-04-10', amt: 8750, desc: 'ACH D-BAJAJ FINANCE EMI' }] },
  { kind: 'employer', label: 'Employer (EPF, gratuity, EDLI)', merchant: 'SALARY TCS LTD', interval: 'monthly', avgAmount: 95000, count: 24, confidence: 1.0, evidence: [{ date: '2025-06-28', amt: 95000, desc: 'SAL CR-TCS LIMITED' }, { date: '2025-05-28', amt: 95000, desc: 'SAL CR-TCS LIMITED' }, { date: '2025-04-28', amt: 95000, desc: 'SAL CR-TCS LIMITED' }] },
  { kind: 'demat', label: 'Demat shares', merchant: 'NSDL DIVIDEND', interval: 'quarterly', avgAmount: 3200, count: 4, confidence: 0.7, evidence: [{ date: '2025-06-15', amt: 3200, desc: 'NEFT-NSDL-DIVIDEND CREDIT' }, { date: '2025-03-15', amt: 3100, desc: 'NEFT-NSDL-DIVIDEND CREDIT' }, { date: '2024-12-15', amt: 3300, desc: 'NEFT-NSDL-DIVIDEND CREDIT' }] },
  { kind: 'savings', label: 'PPF / NPS / FD', merchant: 'INT PD SBI FD', interval: 'quarterly', avgAmount: 12500, count: 6, confidence: 0.75, evidence: [{ date: '2025-06-30', amt: 12500, desc: 'INT PD-SBI FD XXXX4521' }, { date: '2025-03-31', amt: 12600, desc: 'INT PD-SBI FD XXXX4521' }, { date: '2024-12-31', amt: 12400, desc: 'INT PD-SBI FD XXXX4521' }] }
];

let currentLeads = [];

// ─── Upload Handling ──────────────────────────────────────────
function initUpload() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('csvFileInput');
  const fileInfo = document.getElementById('fileInfo');

  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      handleFile(input.files[0]);
    }
  });
}

async function handleFile(file) {
  if (!file.name.endsWith('.csv')) {
    if (typeof showToast === 'function') showToast('Please upload a CSV file', 'error');
    return;
  }

  const fileInfo = document.getElementById('fileInfo');
  fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  // Show loading
  const zone = document.getElementById('uploadZone');
  zone.style.opacity = '0.6';
  zone.style.pointerEvents = 'none';

  try {
    const formData = new FormData();
    formData.append('statement', file);

    const token = typeof getToken === 'function' ? getToken() : localStorage.getItem('anvaya_token');
    const baseUrl = (typeof ANVAYA !== 'undefined' && ANVAYA.API_BASE) || 'http://localhost:5000/api/v1';

    const response = await fetch(`${baseUrl}/discovery/analyze`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Analysis failed');
    }

    const data = await response.json();
    currentLeads = data.leads || [];
    renderResults();

    if (typeof showToast === 'function') {
      showToast(`Analysis complete — ${currentLeads.length} lead(s) found`, 'success');
    }
  } catch (err) {
    console.warn('Discovery API error, using demo data:', err.message);
    currentLeads = [...DEMO_LEADS];
    renderResults();
    if (typeof showToast === 'function') {
      showToast('Server offline — showing demo leads', 'info');
    }
  } finally {
    zone.style.opacity = '1';
    zone.style.pointerEvents = 'auto';
  }
}

// ─── Render Results ───────────────────────────────────────────
function renderResults() {
  const statsRow = document.getElementById('statsRow');
  const disclaimer = document.getElementById('disclaimer');
  const resultsSection = document.getElementById('resultsSection');
  const emptyState = document.getElementById('emptyState');
  const leadsGrid = document.getElementById('leadsGrid');

  if (currentLeads.length === 0) {
    statsRow.style.display = 'none';
    disclaimer.style.display = 'none';
    resultsSection.style.display = 'none';
    emptyState.style.display = '';
    return;
  }

  emptyState.style.display = 'none';
  statsRow.style.display = '';
  disclaimer.style.display = '';
  resultsSection.style.display = '';

  // Stats
  document.getElementById('leadsCount').textContent = currentLeads.length;
  document.getElementById('highConfCount').textContent = currentLeads.filter(l => l.confidence >= 0.8).length;
  document.getElementById('liabilityCount').textContent = currentLeads.filter(l => l.kind === 'liability').length;
  document.getElementById('resultsCount').textContent = `${currentLeads.length} lead(s)`;

  // Cards
  leadsGrid.innerHTML = currentLeads.map((lead, idx) => {
    const iconSvg = KIND_ICONS[lead.kind] || KIND_ICONS.savings;
    const confPct = Math.round(lead.confidence * 100);
    const confClass = confPct >= 80 ? 'high' : confPct >= 50 ? 'medium' : 'low';
    const intervalLabel = lead.interval ? lead.interval.charAt(0).toUpperCase() + lead.interval.slice(1) : 'Irregular';

    const evidenceHTML = (lead.evidence || []).map(e => {
      const d = new Date(e.date);
      const dateStr = isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
      return `<div class="evidence-row">
        <span class="ev-date">${dateStr}</span>
        <span class="ev-desc" title="${e.desc || ''}">${e.desc || '—'}</span>
        <span class="ev-amt">&#8377;${Number(e.amt).toLocaleString('en-IN')}</span>
      </div>`;
    }).join('');

    return `<div class="lead-card fade-in" id="lead-${idx}">
      <div class="lead-card-header">
        <div class="lead-kind-icon ${lead.kind}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
        </div>
        <div class="lead-info">
          <h4>${lead.label}</h4>
          <span class="lead-merchant">${lead.merchant}</span>
        </div>
      </div>
      <div class="lead-meta">
        <span class="lead-meta-item"><strong>&#8377;${Number(lead.avgAmount).toLocaleString('en-IN')}</strong> avg</span>
        <span class="lead-meta-item">${intervalLabel}</span>
        <span class="lead-meta-item">${lead.count} txns</span>
      </div>
      <div class="confidence-label">${confPct}% confidence</div>
      <div class="confidence-bar"><div class="confidence-fill ${confClass}" style="width:${confPct}%"></div></div>
      <button class="evidence-toggle" onclick="toggleEvidence(${idx})">Show evidence transactions &#9662;</button>
      <div class="evidence-list" id="evidence-${idx}">${evidenceHTML}</div>
      <div class="lead-actions">
        <button class="btn btn-confirm" onclick="confirmLead(${idx})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Confirm</button>
        <button class="btn btn-reject" onclick="rejectLead(${idx})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Dismiss</button>
      </div>
    </div>`;
  }).join('');
}

// ─── Evidence Toggle ──────────────────────────────────────────
function toggleEvidence(idx) {
  const el = document.getElementById(`evidence-${idx}`);
  if (el) el.classList.toggle('open');
}

// ─── Confirm Lead ─────────────────────────────────────────────
async function confirmLead(idx) {
  const lead = currentLeads[idx];
  if (!lead) return;

  const card = document.getElementById(`lead-${idx}`);
  if (card) {
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
  }

  try {
    await AnvayaApi.confirmDiscoveryLead(lead);
    if (typeof showToast === 'function') {
      showToast(`"${lead.label}" confirmed — Asset & Claim created`, 'success');
    }
  } catch (err) {
    console.warn('Confirm error (demo mode):', err.message);
    if (typeof showToast === 'function') {
      showToast(`"${lead.label}" confirmed (demo mode)`, 'success');
    }
  }

  currentLeads.splice(idx, 1);
  renderResults();
}

// ─── Reject Lead ──────────────────────────────────────────────
function rejectLead(idx) {
  const card = document.getElementById(`lead-${idx}`);
  if (card) {
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
  }
  setTimeout(() => {
    currentLeads.splice(idx, 1);
    renderResults();
  }, 300);
}

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initUpload();
});

if (typeof initPage === 'function') {
  initPage('discovery');
}

// Export for global access
window.toggleEvidence = toggleEvidence;
window.confirmLead = confirmLead;
window.rejectLead = rejectLead;
