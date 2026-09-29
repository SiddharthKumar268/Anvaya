// ANVAYA - Dashboard Page Logic (Real-time Dynamic Controller)

// Live Application State
let activeFilter = 'all';
let searchQuery = '';

let appDashboardState = {
  claims: {
    pending: [
      { id: 'CLM-101', type: 'lic', title: 'LIC Jeevan Anand Policy', meta: 'Policy No. 1234567890', amount: 500000, dueIn: 5, deadline: '2026-09-21', priority: 'high', authority: 'LIC Connaught Place Branch', docsRequired: ['Death Certificate (Form 2)', 'Policy Bond', 'Nominee KYC (PAN/Aadhaar)', 'Form 3783'] },
      { id: 'CLM-102', type: 'epf', title: 'EPFO / PF & Pension Claim', meta: 'UAN: 101234567890', amount: 480000, dueIn: 12, deadline: '2026-09-28', priority: 'medium', authority: 'EPFO Regional Office Bandra', docsRequired: ['Composite Claim Form 20', 'Form 10D for Pension', 'Cancelled Cheque'] },
      { id: 'CLM-103', type: 'bank', title: 'State Bank of India Savings', meta: 'A/c No. 30281928312', amount: 290000, dueIn: 15, deadline: '2026-10-01', priority: 'medium', authority: 'SBI Main Branch Parliament St', docsRequired: ['Deceased Claim Form DA-2', 'Original Death Cert for verification', 'Nominee KYC'] }
    ],
    inProgress: [
      { id: 'CLM-104', type: 'property', title: 'Residential Property Mutation', meta: 'Plot No. 42B, Sector 15', amount: 3500000, appliedOn: '2026-09-10', priority: 'medium', authority: 'Municipal Corporation / DDA', docsRequired: ['NOC from other heirs', 'Registered Title Deed', 'Surviving Member Certificate'] },
      { id: 'CLM-105', type: 'postoffice', title: 'Post Office PPF Account', meta: 'PPF A/c No. 90281928', amount: 325600, appliedOn: '2026-09-08', priority: 'low', authority: 'Head Post Office GPO', docsRequired: ['Form G for Nominee Claim', 'Original Passbook'] },
      { id: 'CLM-106', type: 'bank', title: 'HDFC Bank Fixed Deposit', meta: 'FD A/c No. 5010023456781', amount: 500000, appliedOn: '2026-09-12', priority: 'medium', authority: 'HDFC Bank Saket Branch', docsRequired: ['FD Receipt', 'Claimant Bank Details'] }
    ],
    done: [
      { id: 'CLM-107', type: 'pmjjby', title: 'PMJJBY Life Insurance', meta: 'Claim ID: PMJ-2026-901', amount: 200000, completedOn: '2026-09-14', authority: 'National Insurance / SBI', docsRequired: ['Death Certificate', 'Bank KYC'] },
      { id: 'CLM-108', type: 'bank', title: 'Sukanya Samriddhi Transfer', meta: 'A/c No. 1234 5678 9012', amount: 188900, completedOn: '2026-09-05', authority: 'Post Office / Punjab National Bank', docsRequired: ['Birth Certificate', 'Guardian KYC'] },
      { id: 'CLM-109', type: 'demat', title: 'Demat Shares Transmission', meta: 'DP ID: IN300892', amount: 360000, completedOn: '2026-08-28', authority: 'Zerodha / CDSL India', docsRequired: ['Form ISR-5', 'Client Master Report'] }
    ]
  },
  documents: {
    collected: 36,
    total: 50
  },
  nextAction: {
    title: 'Submit LIC Claim Form 3783',
    dueInDays: 5,
    type: 'lic',
    claimId: 'CLM-101'
  }
};

function calculatePortfolio() {
  let settled = 0;
  let processing = 0;
  let pending = 0;

  appDashboardState.claims.done.forEach(c => settled += (Number(c.amount) || 0));
  appDashboardState.claims.inProgress.forEach(c => processing += (Number(c.amount) || 0));
  appDashboardState.claims.pending.forEach(c => pending += (Number(c.amount) || 0));

  const total = settled + processing + pending;
  const settledPct = total > 0 ? Math.round((settled / total) * 100) : 0;
  const processingPct = total > 0 ? Math.round((processing / total) * 100) : 0;
  const pendingPct = Math.max(0, 100 - (settledPct + processingPct));

  return {
    total,
    settled,
    processing,
    pending,
    settledPct,
    processingPct,
    pendingPct
  };
}

function createProgressRing(percentage, colorClass, size = 100) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const animId = 'ring_' + colorClass + '_' + Math.random().toString(36).substr(2, 6);

  return `
    <svg class="progress-ring" viewBox="0 0 ${size} ${size}">
      <circle class="ring-track" cx="${size/2}" cy="${size/2}" r="${radius}" />
      <circle class="ring-fill ${colorClass}" cx="${size/2}" cy="${size/2}" r="${radius}" 
        stroke-dasharray="${circumference} ${circumference}" 
        stroke-dashoffset="${circumference}" 
        style="animation: ${animId} 1.2s ease-out forwards; animation-delay: 0.1s;" />
      <style>
        @keyframes ${animId} {
          to { stroke-dashoffset: ${offset}; }
        }
      </style>
    </svg>
    <div class="ring-label">
      <span class="percentage">${percentage}%</span>
      <span class="sub">Progress</span>
    </div>
  `;
}

function getIconForType(type) {
  const icons = {
    lic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    insurance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    epf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>',
    property: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    postoffice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    pmjjby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    demat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
  };
  return icons[type] || icons.bank;
}

function getPriorityDot(priority) {
  const colors = {
    high: 'var(--red, #e74c3c)',
    medium: 'var(--orange, #e67e22)',
    low: 'var(--green, #27ae60)'
  };
  if (!priority) return '';
  return `<span class="priority-dot ${priority}" title="${priority} priority" style="width:8px;height:8px;border-radius:50%;background:${colors[priority] || colors.medium};display:inline-block;"></span>`;
}

function renderClaimCard(claim, status, index) {
  let badgeHtml = '';
  let footerHtml = '';
  const formattedAmount = window.formatCurrency ? window.formatCurrency(claim.amount) : '₹ ' + (claim.amount || 0).toLocaleString('en-IN');
  
  if (status === 'pending') {
    badgeHtml = `<span class="badge badge-gold">⏱️ Due in ${claim.dueIn || 5} days</span>`;
    footerHtml = `
      <div class="claim-date urgent">Deadline: ${claim.deadline ? (window.formatDate ? window.formatDate(claim.deadline) : claim.deadline) : 'ASAP'}</div>
      <div class="claim-priority">${getPriorityDot(claim.priority)} <strong style="color:var(--navy);font-size:12px;">${formattedAmount}</strong></div>
    `;
  } else if (status === 'inProgress') {
    badgeHtml = `<span class="badge badge-blue">🔄 Under Verification</span>`;
    footerHtml = `
      <div class="claim-date">Applied: ${claim.appliedOn ? (window.formatDate ? window.formatDate(claim.appliedOn) : claim.appliedOn) : 'Recently'}</div>
      <div class="claim-priority">${getPriorityDot(claim.priority)} <strong style="color:var(--navy);font-size:12px;">${formattedAmount}</strong></div>
    `;
  } else if (status === 'done') {
    badgeHtml = `<span class="badge badge-green">✓ Settled</span>`;
    footerHtml = `
      <div class="claim-date">Settled: ${claim.completedOn ? (window.formatDate ? window.formatDate(claim.completedOn) : claim.completedOn) : 'Completed'}</div>
      <div class="claim-priority"><strong style="color:#2E7D32;font-size:12px;">${formattedAmount}</strong></div>
    `;
  }

  return `
    <div class="claim-card ${status} fade-in" data-claim-id="${claim.id}" style="animation-delay: ${0.05 * index}s; cursor:pointer;" title="Click to view details">
      <div class="claim-header">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div class="claim-icon">${getIconForType(claim.type)}</div>
          <div>
            <div class="claim-title">${claim.title}</div>
            <div class="claim-meta">${claim.meta}</div>
          </div>
        </div>
      </div>
      <div style="margin-top:8px;">${badgeHtml}</div>
      <div class="claim-footer">
        ${footerHtml}
      </div>
    </div>
  `;
}

function animateValue(obj, start, end, duration, formatFn = null) {
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    obj.innerHTML = formatFn ? formatFn(value) : value;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function updateDashboardUI() {
  const portfolio = calculatePortfolio();

  // 1. Estimated Header Amount
  const estimatedEl = document.getElementById('estimated-amount-val');
  if (estimatedEl) {
    animateValue(estimatedEl, 0, portfolio.total, 1000, (val) => window.formatCurrency ? window.formatCurrency(val) : '₹ ' + val.toLocaleString('en-IN'));
  }

  // 3. Stat Cards
  const totalClaims = appDashboardState.claims.pending.length + appDashboardState.claims.inProgress.length + appDashboardState.claims.done.length;
  const settledClaims = appDashboardState.claims.done.length;
  const pendingClaims = appDashboardState.claims.pending.length + appDashboardState.claims.inProgress.length;
  const claimsProgress = totalClaims > 0 ? Math.round((settledClaims / totalClaims) * 100) : 0;

  const claimsRing = document.getElementById('claims-ring-container');
  if (claimsRing) claimsRing.innerHTML = createProgressRing(claimsProgress, 'green');

  const docsProgress = appDashboardState.documents.total > 0 ? Math.round((appDashboardState.documents.collected / appDashboardState.documents.total) * 100) : 0;
  const docsRing = document.getElementById('docs-ring-container');
  if (docsRing) docsRing.innerHTML = createProgressRing(docsProgress, 'blue');

  document.getElementById('claims-filed-val').innerText = `${settledClaims}`;
  document.getElementById('claims-pending-val').innerText = `${pendingClaims}`;
  document.getElementById('claims-total-val').innerText = `Total: ${totalClaims} Claims Across Institutions`;

  document.getElementById('docs-collected-val').innerText = `${appDashboardState.documents.collected}`;
  document.getElementById('docs-remaining-val').innerText = `${appDashboardState.documents.total - appDashboardState.documents.collected}`;
  document.getElementById('docs-total-val').innerText = `Total: ${appDashboardState.documents.total} Mandatory Documents`;

  const receivedEl = document.getElementById('amount-received-val');
  if (receivedEl) {
    animateValue(receivedEl, 0, portfolio.settled, 1000, (val) => window.formatCurrency ? window.formatCurrency(val) : '₹ ' + val.toLocaleString('en-IN'));
  }
  document.getElementById('amount-percent-val').innerText = `${portfolio.settledPct}% of estimated funds credited`;

  // Next Urgent Action
  if (appDashboardState.nextAction) {
    document.getElementById('action-title-val').innerText = appDashboardState.nextAction.title;
    document.getElementById('action-due-val').innerText = `⏱️ Due in ${appDashboardState.nextAction.dueInDays} days`;
  }

  // Chip counter
  const allChip = document.getElementById('count-all-chip');
  if (allChip) allChip.innerText = totalClaims;

  renderFilteredClaims();
}

function matchesFilter(claim) {
  if (activeFilter !== 'all') {
    if (activeFilter === 'insurance' && !['lic', 'pmjjby', 'insurance'].includes(claim.type)) return false;
    if (activeFilter === 'bank' && claim.type !== 'bank') return false;
    if (activeFilter === 'epf' && claim.type !== 'epf') return false;
    if (activeFilter === 'postoffice' && claim.type !== 'postoffice') return false;
    if (activeFilter === 'property' && !['property', 'demat'].includes(claim.type)) return false;
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const titleMatch = claim.title.toLowerCase().includes(q);
    const metaMatch = claim.meta.toLowerCase().includes(q);
    const idMatch = claim.id.toLowerCase().includes(q);
    if (!titleMatch && !metaMatch && !idMatch) return false;
  }

  return true;
}

function renderFilteredClaims() {
  const pendingFiltered = appDashboardState.claims.pending.filter(matchesFilter);
  const inProgressFiltered = appDashboardState.claims.inProgress.filter(matchesFilter);
  const doneFiltered = appDashboardState.claims.done.filter(matchesFilter);

  const mapColumn = (id, countId, status, dataArray) => {
    const container = document.getElementById(id);
    const countEl = document.getElementById(countId);
    if (container && countEl) {
      countEl.innerText = `(${dataArray.length})`;
      if (dataArray.length === 0) {
        container.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:12px;">No claims in this category</div>`;
      } else {
        container.innerHTML = dataArray.map((c, i) => renderClaimCard(c, status, i)).join('');
      }
    }
  };

  mapColumn('col-pending-cards', 'count-pending', 'pending', pendingFiltered);
  mapColumn('col-inprogress-cards', 'count-inprogress', 'inProgress', inProgressFiltered);
  mapColumn('col-done-cards', 'count-done', 'done', doneFiltered);

  // Attach card click handlers for overview modal
  document.querySelectorAll('.claim-card').forEach(card => {
    card.addEventListener('click', () => {
      const claimId = card.getAttribute('data-claim-id');
      openClaimDetailModal(claimId);
    });
  });
}

// --- Claim Details Modal ---
let selectedClaim = null;
let selectedClaimStatus = null;

function findClaimById(id) {
  for (const status of ['pending', 'inProgress', 'done']) {
    const found = appDashboardState.claims[status].find(c => c.id === id);
    if (found) return { claim: found, status };
  }
  return null;
}

function openClaimDetailModal(claimId) {
  const result = findClaimById(claimId);
  if (!result) return;

  selectedClaim = result.claim;
  selectedClaimStatus = result.status;

  const modal = document.getElementById('claimDetailModal');
  const modalBody = document.getElementById('claimModalBody');
  const primaryBtn = document.getElementById('claimActionPrimary');

  const formattedAmount = window.formatCurrency ? window.formatCurrency(selectedClaim.amount) : '₹ ' + (selectedClaim.amount || 0).toLocaleString('en-IN');

  modalBody.innerHTML = `
    <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
      <div style="width:44px; height:44px; border-radius:10px; background:rgba(37,118,166,0.1); color:var(--blue); display:flex; align-items:center; justify-content:center;">
        ${getIconForType(selectedClaim.type)}
      </div>
      <div>
        <h4 style="font-size:16px; color:var(--navy); margin-bottom:2px; font-family:var(--font-primary);">${selectedClaim.title}</h4>
        <span style="font-size:12px; color:var(--text-muted);">${selectedClaim.meta} • ID: ${selectedClaim.id}</span>
      </div>
    </div>

    <div style="background:#F8FAFC; border:1px solid var(--border-light); border-radius:8px; padding:12px 16px; display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
      <div>
        <div style="font-size:11px; color:var(--text-muted);">ESTIMATED VALUE</div>
        <div style="font-size:16px; font-weight:700; color:var(--navy);">${formattedAmount}</div>
      </div>
      <div>
        <div style="font-size:11px; color:var(--text-muted);">CURRENT STATUS</div>
        <div style="font-size:13px; font-weight:600; color:${selectedClaimStatus === 'done' ? '#2E7D32' : selectedClaimStatus === 'inProgress' ? 'var(--blue)' : 'var(--orange)'}; text-transform:capitalize;">
          ${selectedClaimStatus === 'done' ? '✓ Settled & Transferred' : selectedClaimStatus === 'inProgress' ? '🔄 Under Active Verification' : '⏳ Pending Action'}
        </div>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <div style="font-size:12px; font-weight:700; color:var(--navy); margin-bottom:4px;">Processing Authority</div>
      <div style="font-size:13px; color:var(--text-secondary);">${selectedClaim.authority || 'Regional Claim Office'}</div>
    </div>

    <div>
      <div style="font-size:12px; font-weight:700; color:var(--navy); margin-bottom:6px;">Required Documents & Forms</div>
      <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px;">
        ${(selectedClaim.docsRequired || ['Death Certificate', 'Nominee KYC', 'Cancelled Cheque']).map(doc => `
          <li style="font-size:12px; color:var(--text-secondary); display:flex; align-items:center; gap:8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ${doc}
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  if (selectedClaimStatus === 'pending') {
    primaryBtn.textContent = 'Move to In-Verification →';
  } else if (selectedClaimStatus === 'inProgress') {
    primaryBtn.textContent = 'Mark as Settled ✓';
  } else {
    primaryBtn.textContent = 'Reopen Claim 🔄';
  }

  modal.classList.add('active');
}

function closeClaimModal() {
  const modal = document.getElementById('claimDetailModal');
  if (modal) modal.classList.remove('active');
}

// --- Add Claim Modal ---
function openAddClaimModal(initialStatus = 'pending') {
  const modal = document.getElementById('addClaimModal');
  const statusSelect = document.getElementById('newClaimStatus');
  if (statusSelect) statusSelect.value = initialStatus;
  if (modal) modal.classList.add('active');
}

function closeAddModal() {
  const modal = document.getElementById('addClaimModal');
  if (modal) modal.classList.remove('active');
}

// Global hook for inline onclicks
window.openAddClaimModal = openAddClaimModal;

// --- Initialize Page and Events ---
document.addEventListener('DOMContentLoaded', () => {
  if (window.initPage) {
    window.initPage('dashboard', {
      greeting: 'Namaste!',
      subtitle: "We're with you in every step of this journey.",
      notificationCount: 3
    });
  }

  updateDashboardUI();

  // Restore cached AI Case Summary on page load if previously generated
  try {
    const cachedSummaryStr = localStorage.getItem('anvaya_cached_ai_summary');
    if (cachedSummaryStr) {
      const cached = JSON.parse(cachedSummaryStr);
      if (cached && cached.summary) {
        renderAISummaryData(cached.summary, cached.generatedAt);
      }
    }
  } catch (e) {}

  // Filter Chips Listener
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter');
      renderFilteredClaims();
    });
  });

  // Search input
  const searchInput = document.getElementById('tracker-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderFilteredClaims();
    });
  }

  // Claim Detail Modal Controls
  const closeClaimDetailBtn = document.getElementById('closeClaimDetailModal');
  const claimSecondaryBtn = document.getElementById('claimActionSecondary');
  const claimPrimaryBtn = document.getElementById('claimActionPrimary');

  if (closeClaimDetailBtn) closeClaimDetailBtn.addEventListener('click', closeClaimModal);
  if (claimSecondaryBtn) claimSecondaryBtn.addEventListener('click', closeClaimModal);

  if (claimPrimaryBtn) {
    claimPrimaryBtn.addEventListener('click', () => {
      if (!selectedClaim || !selectedClaimStatus) return;

      // Remove from current status
      appDashboardState.claims[selectedClaimStatus] = appDashboardState.claims[selectedClaimStatus].filter(c => c.id !== selectedClaim.id);

      // Cycle to next status
      let nextStatus = 'inProgress';
      if (selectedClaimStatus === 'pending') {
        nextStatus = 'inProgress';
        selectedClaim.appliedOn = new Date().toISOString().split('T')[0];
        if (typeof showToast === 'function') showToast(`Claim "${selectedClaim.title}" moved to In-Verification!`, 'info');
      } else if (selectedClaimStatus === 'inProgress') {
        nextStatus = 'done';
        selectedClaim.completedOn = new Date().toISOString().split('T')[0];
        if (typeof showToast === 'function') showToast(`🎉 Claim "${selectedClaim.title}" settled & added to received funds!`, 'success');
      } else {
        nextStatus = 'pending';
        if (typeof showToast === 'function') showToast(`Claim "${selectedClaim.title}" reopened.`, 'warning');
      }

      appDashboardState.claims[nextStatus].push(selectedClaim);
      closeClaimModal();
      updateDashboardUI();
    });
  }

  // Add Claim Modal Controls
  const openAddBtn = document.getElementById('openAddClaimModalBtn');
  const closeAddBtn = document.getElementById('closeAddClaimModal');
  const cancelAddBtn = document.getElementById('cancelAddClaimBtn');
  const addClaimForm = document.getElementById('addClaimForm');

  if (openAddBtn) openAddBtn.addEventListener('click', () => openAddClaimModal('pending'));
  if (closeAddBtn) closeAddBtn.addEventListener('click', closeAddModal);
  if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);

  if (addClaimForm) {
    addClaimForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('newClaimType').value;
      const title = document.getElementById('newClaimTitle').value.trim();
      const meta = document.getElementById('newClaimMeta').value.trim();
      const amount = Number(document.getElementById('newClaimAmount').value) || 0;
      const status = document.getElementById('newClaimStatus').value;
      const deadline = document.getElementById('newClaimDeadline').value;

      if (!title || !meta) {
        if (typeof showToast === 'function') showToast('Please enter all required fields.', 'error');
        return;
      }

      const newClaim = {
        id: `CLM-${Math.floor(100 + Math.random() * 900)}`,
        type,
        title,
        meta,
        amount,
        deadline,
        dueIn: 7,
        priority: 'medium',
        authority: 'Verified Institutional Branch',
        docsRequired: ['Death Certificate', 'Nominee KYC', 'Bank Account Mandate']
      };

      if (status === 'done') newClaim.completedOn = new Date().toISOString().split('T')[0];
      if (status === 'inProgress') newClaim.appliedOn = new Date().toISOString().split('T')[0];

      appDashboardState.claims[status].unshift(newClaim);

      // Add to activity stream
      const streamList = document.getElementById('activity-stream-list');
      if (streamList) {
        const itemHtml = `
          <div class="activity-item fade-in">
            <div class="activity-icon icon-blue">
              ${getIconForType(type)}
            </div>
            <div class="activity-content">
              <div class="activity-text"><strong>${title}</strong> added to ${status === 'done' ? 'Settled' : status === 'inProgress' ? 'Verification' : 'Pending'}.</div>
              <div class="activity-time">Just now • Manual Entry</div>
            </div>
          </div>
        `;
        streamList.insertAdjacentHTML('afterbegin', itemHtml);
      }

      closeAddModal();
      addClaimForm.reset();
      updateDashboardUI();

      if (typeof showToast === 'function') {
        showToast(`Added "${title}" (${window.formatCurrency ? window.formatCurrency(amount) : '₹' + amount}) successfully!`, 'success');
      }
    });
  }

  // Urgent Action button
  const urgentActionBtn = document.getElementById('urgentActionBtn');
  if (urgentActionBtn) {
    urgentActionBtn.addEventListener('click', () => {
      openClaimDetailModal('CLM-101');
    });
  }

  // ==========================================
  // ✨ AI Case Executive Summary Feature
  // ==========================================
  const aiSummaryBtn = document.getElementById('generateAISummaryBtn');
  const aiSummaryModal = document.getElementById('aiSummaryModal');
  const closeAISummaryModal = document.getElementById('closeAISummaryModal');
  const closeAISummaryBtn = document.getElementById('closeAISummaryBtn');
  const refreshAISummaryBtn = document.getElementById('refreshAISummaryBtn');
  const aiSummaryLoading = document.getElementById('aiSummaryLoading');
  const aiSummaryContent = document.getElementById('aiSummaryContent');

  function openAISummaryModalFn() {
    if (aiSummaryModal) {
      aiSummaryModal.classList.add('active');
      aiSummaryModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeAISummaryModalFn() {
    if (aiSummaryModal) {
      aiSummaryModal.classList.remove('active');
      aiSummaryModal.setAttribute('aria-hidden', 'true');
    }
    if (window.AnvayaVoice && window.AnvayaVoice.isPlaying) {
      window.AnvayaVoice.stop();
    }
  }

  function escSummaryHTML(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function buildSpokenBriefing(summary, pct) {
    let spoken = `Anvaya AI Case Executive Summary. Overall status is ${summary.overallStatus || 'Active'}, with ${pct} percent recovery progress. ${summary.summaryNarrative || ''}. `;
    if (summary.strengths && summary.strengths.length > 0) {
      spoken += `Verified case strengths: ${summary.strengths.join('. ')}. `;
    }
    if (summary.risks && summary.risks.length > 0) {
      spoken += `Limitation risks and focus areas: ${summary.risks.join('. ')}. `;
    }
    if (summary.nextSteps && summary.nextSteps.length > 0) {
      spoken += 'Recommended next action steps: ';
      summary.nextSteps.forEach((s, idx) => {
        spoken += `Step ${idx + 1}, priority ${s.priority || 'Action'}: ${s.action || ''}. Target deadline: ${s.deadline || 'Soon'}. `;
      });
    }
    if (summary.estimatedTimeToCompletion) {
      spoken += `Estimated recovery timeline is ${summary.estimatedTimeToCompletion}. `;
    }
    if (summary.encouragement) {
      spoken += `Closing message: ${summary.encouragement}`;
    }
    return spoken;
  }

  function renderAISummaryData(summary, generatedAt) {
    if (!aiSummaryContent) return;

    const statusConfig = {
      'On Track': { bg: 'rgba(46, 125, 50, 0.12)', text: '#2E7D32', border: 'rgba(46, 125, 50, 0.3)', icon: '✅' },
      'Needs Attention': { bg: 'rgba(217, 119, 6, 0.12)', text: '#B45309', border: 'rgba(217, 119, 6, 0.3)', icon: '⚠️' },
      'Critical Action Required': { bg: 'rgba(220, 38, 38, 0.12)', text: '#DC2626', border: 'rgba(220, 38, 38, 0.3)', icon: '🚨' }
    };
    const sc = statusConfig[summary.overallStatus] || statusConfig['Needs Attention'];
    const pct = summary.completionPercent !== undefined ? summary.completionPercent : 0;

    const strengthsHTML = (summary.strengths || []).map(s => `
      <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:8px;">
        <span style="color:#2E7D32; font-weight:700; flex-shrink:0;">✓</span>
        <span style="font-size:12.5px; color:var(--text-primary); line-height:1.4;">${escSummaryHTML(s)}</span>
      </div>
    `).join('');

    const risksHTML = (summary.risks || []).map(r => `
      <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:8px;">
        <span style="color:#DC2626; font-weight:700; flex-shrink:0;">!</span>
        <span style="font-size:12.5px; color:var(--text-primary); line-height:1.4;">${escSummaryHTML(r)}</span>
      </div>
    `).join('');

    const priorityColors = {
      HIGH: { bg: '#FEE2E2', text: '#B91C1C' },
      MEDIUM: { bg: '#FEF3C7', text: '#B45309' },
      LOW: { bg: '#DCFCE7', text: '#15803D' }
    };

    const stepsHTML = (summary.nextSteps || []).map((s, idx) => {
      const pc = priorityColors[s.priority] || priorityColors.MEDIUM;
      return `
        <div style="display:flex; align-items:flex-start; gap:10px; padding:10px 14px; background:var(--surface, #F8FAFC); border:1px solid var(--border-light, #E2E8F0); border-radius:8px; margin-bottom:8px;">
          <span style="background:${pc.bg}; color:${pc.text}; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:12px; flex-shrink:0; margin-top:2px; letter-spacing:0.3px;">
            ${escSummaryHTML(s.priority || 'ACTION')}
          </span>
          <div style="flex:1;">
            <div style="font-size:13px; font-weight:600; color:var(--navy); line-height:1.4;">${escSummaryHTML(s.action)}</div>
            ${s.deadline ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">⏱️ ${escSummaryHTML(s.deadline)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const formattedTime = generatedAt
      ? new Date(generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : 'Just now';

    aiSummaryContent.innerHTML = `
      <!-- Header Badge + Progress Row -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
        <div style="display:inline-flex; align-items:center; gap:8px; background:${sc.bg}; color:${sc.text}; border:1px solid ${sc.border}; padding:6px 14px; border-radius:20px; font-size:12.5px; font-weight:700;">
          <span>${sc.icon}</span>
          <span>${escSummaryHTML(summary.overallStatus || 'Status')}</span>
        </div>
        <div style="display:flex; align-items:baseline; gap:6px;">
          <span style="font-size:22px; font-weight:800; color:var(--blue); font-family:var(--font-primary);">${pct}%</span>
          <span style="font-size:11.5px; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Anvaya Recovery Progress</span>
        </div>
      </div>

      <!-- Siri-like Voice Briefing Player Bar -->
      <div class="summary-voice-briefing-bar">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:20px;">🎙️</span>
          <div>
            <div style="font-size:13px; font-weight:700; color:var(--navy);">Audio Executive Briefing</div>
            <div style="font-size:11.5px; color:var(--text-muted);">Listen to Anvaya Voice speak your recovery status & next steps</div>
          </div>
        </div>
        <button type="button" class="btn voice-briefing-play-btn" id="modalVoiceBriefingBtn">
          <span class="briefing-btn-icon">🔊</span>
          <span class="briefing-btn-text">Listen to Briefing</span>
          <span class="audio-wave-visualizer" style="display:none;">
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
          </span>
        </button>
      </div>

      <!-- Linear Progress Bar -->
      <div style="height:6px; background:var(--border-light, #E2E8F0); border-radius:3px; margin-bottom:16px; overflow:hidden;">
        <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--blue) 0%, #10B981 100%); border-radius:3px; transition:width 0.8s ease;"></div>
      </div>

      <!-- Executive Narrative -->
      <div style="background:linear-gradient(135deg, rgba(74,144,226,0.06), rgba(11,40,84,0.02)); border-left:3.5px solid var(--blue); padding:14px 16px; border-radius:0 8px 8px 0; margin-bottom:18px;">
        <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--blue); margin-bottom:4px; display:flex; align-items:center; gap:6px;">
          <span>✨</span> <span>Anvaya AI Case Executive Summary</span>
        </div>
        <p style="font-size:13.5px; line-height:1.65; color:var(--text-primary); margin:0;">${escSummaryHTML(summary.summaryNarrative)}</p>
      </div>

      <!-- Strengths & Risks Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px;">
        <div style="background:rgba(46,125,50,0.04); border:1px solid rgba(46,125,50,0.15); border-radius:8px; padding:12px 14px;">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#2E7D32; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
            <span>🛡️</span> <span>Verified Case Strengths</span>
          </div>
          ${strengthsHTML || '<div style="font-size:12px; color:var(--text-muted);">No verified items yet</div>'}
        </div>
        <div style="background:rgba(220,38,38,0.04); border:1px solid rgba(220,38,38,0.15); border-radius:8px; padding:12px 14px;">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#DC2626; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
            <span>⚠️</span> <span>Limitation Risks & Action Traps</span>
          </div>
          ${risksHTML || '<div style="font-size:12px; color:var(--text-muted);">No critical risks found</div>'}
        </div>
      </div>

      <!-- Actionable Next Steps Roadmap -->
      <div style="margin-bottom:18px;">
        <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-muted); margin-bottom:8px; display:flex; align-items:center; gap:4px;">
          <span>🎯</span> <span>Anvaya Action Roadmap</span>
        </div>
        ${stepsHTML || '<div style="font-size:12px; color:var(--text-muted);">Complete checklist to get AI action steps</div>'}
      </div>

      <!-- Metadata & Estimated Completion -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-top:1px solid var(--border-light, #E2E8F0); font-size:12px; color:var(--text-muted);">
        <div>Est. Recovery Timeline: <strong style="color:var(--navy);">${escSummaryHTML(summary.estimatedTimeToCompletion || '4-6 Weeks')}</strong></div>
        <div>Anvaya AI • ${formattedTime}</div>
      </div>

      <!-- Encouragement Message -->
      ${summary.encouragement ? `
        <div style="background:linear-gradient(135deg, rgba(231,190,98,0.12), rgba(11,40,84,0.04)); border:1px solid rgba(213,165,70,0.25); border-radius:8px; padding:12px 16px; margin-top:12px; text-align:center;">
          <p style="font-size:12.5px; color:var(--text-primary); margin:0; font-style:italic; line-height:1.5;">🕊️ "${escSummaryHTML(summary.encouragement)}"</p>
        </div>
      ` : ''}
    `;

    aiSummaryContent.style.display = 'block';

    const spokenBriefingText = buildSpokenBriefing(summary, pct);

    // Wire up Modal Voice Briefing Button
    const modalBriefingBtn = document.getElementById('modalVoiceBriefingBtn');
    if (modalBriefingBtn && window.AnvayaVoice && window.AnvayaVoice.isSupported()) {
      const briefingIcon = modalBriefingBtn.querySelector('.briefing-btn-icon');
      const briefingLabel = modalBriefingBtn.querySelector('.briefing-btn-text');
      const waveVis = modalBriefingBtn.querySelector('.audio-wave-visualizer');

      function updateModalBriefingBtn(isSpeaking) {
        if (isSpeaking) {
          modalBriefingBtn.classList.add('speaking');
          if (briefingLabel) briefingLabel.textContent = 'Stop Briefing';
          if (briefingIcon) briefingIcon.textContent = '⏹️';
          if (waveVis) waveVis.style.display = 'inline-flex';
        } else {
          modalBriefingBtn.classList.remove('speaking');
          if (briefingLabel) briefingLabel.textContent = 'Listen to Briefing';
          if (briefingIcon) briefingIcon.textContent = '🔊';
          if (waveVis) waveVis.style.display = 'none';
        }
      }

      modalBriefingBtn.addEventListener('click', () => {
        if (window.AnvayaVoice.getActiveId() === 'dashboard_modal_briefing' && window.AnvayaVoice.isPlaying) {
          window.AnvayaVoice.stop();
          updateModalBriefingBtn(false);
        } else {
          window.AnvayaVoice.speak(spokenBriefingText, 'dashboard_modal_briefing', {
            onStart: () => updateModalBriefingBtn(true),
            onEnd: () => updateModalBriefingBtn(false),
            onError: () => updateModalBriefingBtn(false)
          });
        }
      });
    }

    // ========================================================
    // 🌟 Embed dynamic summary widget directly into Dashboard
    // ========================================================
    const dashWidget = document.getElementById('dashboardAISummaryWidget');
    const dashNarrative = document.getElementById('dashSummaryNarrative');
    const dashStatusPill = document.getElementById('dashSummaryStatusPill');
    const dashTimestamp = document.getElementById('dashSummaryTimestamp');
    const dashStrengths = document.getElementById('dashSummaryStrengths');
    const dashRisks = document.getElementById('dashSummaryRisks');
    const dashNextAction = document.getElementById('dashSummaryNextAction');
    const dashWidgetVoiceBtn = document.getElementById('dashWidgetVoiceBtn');

    if (dashWidget && dashNarrative) {
      dashNarrative.textContent = summary.summaryNarrative || '';
      
      if (dashStatusPill) {
        dashStatusPill.className = 'badge';
        if (summary.overallStatus === 'On Track') {
          dashStatusPill.classList.add('badge-green');
        } else if (summary.overallStatus === 'Needs Attention') {
          dashStatusPill.classList.add('badge-gold');
        } else {
          dashStatusPill.classList.add('badge-red');
        }
        dashStatusPill.textContent = `${sc.icon} ${summary.overallStatus || 'Active'}`;
        dashStatusPill.style.padding = '4px 10px';
        dashStatusPill.style.fontSize = '11.5px';
        dashStatusPill.style.fontWeight = '700';
      }

      if (dashTimestamp) {
        dashTimestamp.textContent = `Generated: ${formattedTime}`;
      }

      if (dashStrengths) {
        const topStrength = (summary.strengths && summary.strengths[0]) || 'Case initialized in Anvaya platform';
        dashStrengths.textContent = topStrength;
      }

      if (dashRisks) {
        const topRisk = (summary.risks && summary.risks[0]) || 'Keep all certified settlement vouchers safely';
        dashRisks.textContent = topRisk;
      }

      if (dashNextAction) {
        const topStep = (summary.nextSteps && summary.nextSteps[0])
          ? `${summary.nextSteps[0].action} (${summary.nextSteps[0].deadline || 'Soon'})`
          : 'Complete pending document verification';
        dashNextAction.textContent = topStep;
      }

      // Wire up Dashboard Widget Voice Button
      if (dashWidgetVoiceBtn && window.AnvayaVoice && window.AnvayaVoice.isSupported()) {
        const dIcon = dashWidgetVoiceBtn.querySelector('.dash-briefing-icon');
        const dLabel = dashWidgetVoiceBtn.querySelector('.dash-briefing-label');
        const dWave = dashWidgetVoiceBtn.querySelector('.audio-wave-visualizer');

        function updateWidgetVoiceBtn(isSpeaking) {
          if (isSpeaking) {
            dashWidgetVoiceBtn.classList.add('speaking');
            if (dLabel) dLabel.textContent = 'Stop';
            if (dIcon) dIcon.textContent = '⏹️';
            if (dWave) dWave.style.display = 'inline-flex';
          } else {
            dashWidgetVoiceBtn.classList.remove('speaking');
            if (dLabel) dLabel.textContent = 'Listen';
            if (dIcon) dIcon.textContent = '🎙️';
            if (dWave) dWave.style.display = 'none';
          }
        }

        dashWidgetVoiceBtn.onclick = (e) => {
          e.stopPropagation();
          if (window.AnvayaVoice.getActiveId() === 'dashboard_widget_briefing' && window.AnvayaVoice.isPlaying) {
            window.AnvayaVoice.stop();
            updateWidgetVoiceBtn(false);
          } else {
            window.AnvayaVoice.speak(spokenBriefingText, 'dashboard_widget_briefing', {
              onStart: () => updateWidgetVoiceBtn(true),
              onEnd: () => updateWidgetVoiceBtn(false),
              onError: () => updateWidgetVoiceBtn(false)
            });
          }
        };
      }

      dashWidget.style.display = 'block';
    }

    // Persist in localStorage for instant rendering on dashboard reloads
    try {
      localStorage.setItem('anvaya_cached_ai_summary', JSON.stringify({ summary, generatedAt }));
    } catch (e) {}
  }

  async function triggerAISummaryGeneration() {
    // 1. Immediately open modal for instant visual feedback
    openAISummaryModalFn();
    if (aiSummaryLoading) aiSummaryLoading.style.display = 'block';
    if (aiSummaryContent) aiSummaryContent.style.display = 'none';
    if (refreshAISummaryBtn) refreshAISummaryBtn.style.display = 'none';

    try {
      const caseId = getCaseId() || 'active';
      
      // Prepare live context from dashboard state in case user has not completed onboarding
      const payload = {
        context: {
          documents: appDashboardState.documents,
          claims: {
            total: (appDashboardState.claims.pending.length + appDashboardState.claims.inProgress.length + appDashboardState.claims.done.length),
            done: appDashboardState.claims.done.length,
            inProgress: appDashboardState.claims.inProgress.length,
            pending: appDashboardState.claims.pending.length,
            list: [
              ...appDashboardState.claims.pending.map(c => ({ ...c, status: 'pending' })),
              ...appDashboardState.claims.inProgress.map(c => ({ ...c, status: 'inProgress' })),
              ...appDashboardState.claims.done.map(c => ({ ...c, status: 'done' }))
            ]
          }
        }
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI analysis timed out. Please retry.')), 35000)
      );

      const apiCall = apiRequest(`/cases/${caseId}/ai-summary`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const data = await Promise.race([apiCall, timeoutPromise]);

      if (data && data.summary) {
        if (data.caseId && typeof ANVAYA !== 'undefined') {
          localStorage.setItem(ANVAYA.CASE_KEY, data.caseId);
        }
        renderAISummaryData(data.summary, data.generatedAt);
      } else {
        throw new Error('Invalid summary response');
      }
    } catch (err) {
      console.error('AI Case Summary error:', err);
      if (aiSummaryContent) {
        aiSummaryContent.innerHTML = `
          <div style="text-align:center; padding:30px 20px;">
            <div style="font-size:32px; margin-bottom:10px;">⚠️</div>
            <div style="font-size:14px; font-weight:700; color:var(--navy);">Unable to Generate AI Summary</div>
            <p style="font-size:12.5px; color:var(--text-muted); margin-top:6px; max-width:420px; margin-left:auto; margin-right:auto; line-height:1.5;">
              ${err.message && err.message.includes('timed out') ? 'The AI analysis took too long. Please click Regenerate to retry.' : 'The AI intelligence service encountered a temporary error. Please click "Regenerate Analysis" to retry.'}
            </p>
          </div>
        `;
        aiSummaryContent.style.display = 'block';
      }
    } finally {
      if (aiSummaryLoading) aiSummaryLoading.style.display = 'none';
      if (refreshAISummaryBtn) refreshAISummaryBtn.style.display = 'inline-flex';
    }
  }

  // Expose globally for backup inline onclicks
  window.triggerAISummaryGeneration = triggerAISummaryGeneration;
  window.openAISummaryModalFn = openAISummaryModalFn;
  window.closeAISummaryModalFn = closeAISummaryModalFn;

  // Wire event listeners
  if (aiSummaryBtn) {
    aiSummaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerAISummaryGeneration();
    });
  }
  if (closeAISummaryModal) {
    closeAISummaryModal.addEventListener('click', closeAISummaryModalFn);
  }
  if (closeAISummaryBtn) {
    closeAISummaryBtn.addEventListener('click', closeAISummaryModalFn);
  }
  if (refreshAISummaryBtn) {
    refreshAISummaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerAISummaryGeneration();
    });
  }
  if (aiSummaryModal) {
    aiSummaryModal.addEventListener('click', (e) => {
      if (e.target === aiSummaryModal) closeAISummaryModalFn();
    });
  }
});


