// ANVAYA - Dashboard Page Logic

const DEMO_DASHBOARD = {
  claimsFiled: 17,
  claimsPending: 8,
  claimsTotal: 25,
  claimsProgress: 68,
  docsCollected: 36,
  docsRemaining: 14,
  docsTotal: 50,
  docsProgress: 72,
  amountReceived: 748900,
  amountEstimated: 1864500,
  amountPercentage: 40,
  nextAction: {
    title: 'Submit LIC Claim Form',
    dueInDays: 5,
    type: 'claim'
  }
};

const DEMO_CLAIMS = {
  pending: [
    { id: 1, type: 'lic', title: 'LIC Policy Claim', meta: 'Policy No. 1234567890', dueIn: 5, deadline: '2024-05-27', priority: 'high' },
    { id: 2, type: 'epf', title: 'EPFO / PF Claim', meta: 'UAN: 101234567890', dueIn: 12, deadline: '2024-06-03', priority: 'medium' },
    { id: 3, type: 'bank', title: 'Bank Account Settlement', meta: 'State Bank of India', dueIn: 15, deadline: '2024-06-06', priority: 'medium' }
  ],
  inProgress: [
    { id: 4, type: 'property', title: 'Property Mutation', meta: 'Residential Property', appliedOn: '2024-05-10', priority: 'medium' },
    { id: 5, type: 'postoffice', title: 'Post Office Scheme', meta: 'PPF Account', appliedOn: '2024-05-08', priority: 'low' },
    { id: 6, type: 'bank', title: 'HDFC Bank FD Closure', meta: 'FD A/c No. 5010023456781', appliedOn: '2024-05-12', priority: 'medium' }
  ],
  done: [
    { id: 7, type: 'pmjjby', title: 'PMJJBY Claim', meta: 'A/c No. XXXXX1234', completedOn: '2024-05-02' },
    { id: 8, type: 'bank', title: 'Sukanya Samriddhi A/c', meta: 'A/c No. 1234 5678 9012', completedOn: '2024-04-28' },
    { id: 9, type: 'demat', title: 'Demat Account Transfer', meta: 'DP ID: IN300XXX', completedOn: '2024-04-18' }
  ]
};

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
        style="animation: ${animId} 1.5s ease-out forwards; animation-delay: 0.2s;" />
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
    high: 'var(--red)',
    medium: 'var(--orange)',
    low: 'var(--green)'
  };
  if (!priority) return '';
  return `<span class="priority-dot ${priority}" style="display:inline-block;"></span>`;
}

function renderClaimCard(claim, status, index) {
  let badgeHtml = '';
  let footerHtml = '';
  
  if (status === 'pending') {
    badgeHtml = `<span class="badge badge-gold">Due in ${claim.dueIn} days</span>`;
    footerHtml = `
      <div class="claim-date urgent">Deadline: ${formatDate ? formatDate(claim.deadline) : claim.deadline}</div>
      <div class="claim-priority">${getPriorityDot(claim.priority)}</div>
    `;
  } else if (status === 'inProgress') {
    badgeHtml = `<span class="badge badge-blue">In progress</span>`;
    footerHtml = `
      <div class="claim-date">Applied on: ${formatDate ? formatDate(claim.appliedOn) : claim.appliedOn}</div>
      <div class="claim-priority">${getPriorityDot(claim.priority)}</div>
    `;
  } else if (status === 'done') {
    badgeHtml = `<span class="badge badge-green">Completed</span>`;
    footerHtml = `
      <div class="claim-date">Completed on: ${formatDate ? formatDate(claim.completedOn) : claim.completedOn}</div>
    `;
  }

  const animationDelay = 0.3 + (index * 0.05);

  return `
    <div class="claim-card ${status} fade-in" style="animation-delay: ${animationDelay}s">
      <div class="claim-header">
        <div style="display:flex; gap:12px;">
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

function renderStats(data) {
  // Estimated Amount
  const estimatedEl = document.getElementById('estimated-amount-val');
  if (estimatedEl) {
    animateValue(estimatedEl, 0, data.amountEstimated, 1500, (val) => window.formatCurrency ? window.formatCurrency(val) : '₹ ' + val.toLocaleString('en-IN'));
  }

  // Rings
  const claimsRing = document.getElementById('claims-ring-container');
  if (claimsRing) claimsRing.innerHTML = createProgressRing(data.claimsProgress, 'green');

  const docsRing = document.getElementById('docs-ring-container');
  if (docsRing) docsRing.innerHTML = createProgressRing(data.docsProgress, 'blue');

  // Stats Text
  document.getElementById('claims-filed-val').innerText = data.claimsFiled;
  document.getElementById('claims-pending-val').innerText = data.claimsPending;
  document.getElementById('claims-total-val').innerText = `Total: ${data.claimsTotal} Claims`;

  document.getElementById('docs-collected-val').innerText = data.docsCollected;
  document.getElementById('docs-remaining-val').innerText = data.docsRemaining;
  document.getElementById('docs-total-val').innerText = `Total: ${data.docsTotal} Documents`;

  // Amount Received
  const receivedEl = document.getElementById('amount-received-val');
  if (receivedEl) {
    animateValue(receivedEl, 0, data.amountReceived, 1500, (val) => window.formatCurrency ? window.formatCurrency(val) : '₹ ' + val.toLocaleString('en-IN'));
  }
  document.getElementById('amount-percent-val').innerText = `${data.amountPercentage}% of total estimated`;

  // Next Action
  if (data.nextAction) {
    document.getElementById('action-title-val').innerText = data.nextAction.title;
    document.getElementById('action-due-val').innerText = `Due in ${data.nextAction.dueInDays} days`;
  }
}

function renderClaims(claimsData) {
  const mapColumn = (id, countId, status, dataArray) => {
    const container = document.getElementById(id);
    const countEl = document.getElementById(countId);
    if (container && countEl) {
      countEl.innerText = `(${dataArray.length})`;
      container.innerHTML = dataArray.map((c, i) => renderClaimCard(c, status, i)).join('');
    }
  };

  mapColumn('col-pending-cards', 'count-pending', 'pending', claimsData.pending);
  mapColumn('col-inprogress-cards', 'count-inprogress', 'inProgress', claimsData.inProgress);
  mapColumn('col-done-cards', 'count-done', 'done', claimsData.done);
}

function mapServerClaims(serverClaims) {
  const pending = [];
  const inProgress = [];
  const done = [];

  serverClaims.forEach(claim => {
    const mapped = {
      id: claim._id,
      type: claim.claimType,
      title: getClaimTitle(claim.claimType),
      meta: claim.claimType.toUpperCase() + ' Claim',
      deadline: claim.deadline,
      priority: getPriorityFromDeadline(claim.deadline)
    };

    if (claim.status === 'pending') {
      mapped.dueIn = claim.deadline ? (typeof daysUntil === 'function' ? daysUntil(claim.deadline) : 30) : null;
      pending.push(mapped);
    } else if (claim.status === 'in-progress') {
      mapped.appliedOn = claim.filedOn || new Date().toISOString();
      inProgress.push(mapped);
    } else if (claim.status === 'done') {
      mapped.completedOn = claim.filedOn || new Date().toISOString();
      done.push(mapped);
    }
  });

  return { pending, inProgress, done };
}

function getClaimTitle(type) {
  const titles = {
    bank: 'Bank Account Settlement',
    lic: 'LIC Policy Claim',
    epf: 'EPFO / PF Claim',
    property: 'Property Mutation',
    postoffice: 'Post Office Scheme',
    pmjjby: 'PMJJBY Claim',
    pmsby: 'PMSBY Claim'
  };
  return titles[type] || type.toUpperCase() + ' Claim';
}

function getPriorityFromDeadline(deadline) {
  if (!deadline) return 'medium';
  const days = typeof daysUntil === 'function' ? daysUntil(deadline) : 30;
  if (days <= 5) return 'high';
  if (days <= 15) return 'medium';
  return 'low';
}

async function loadDashboard() {
  const caseId = typeof getCaseId === 'function' ? getCaseId() : null;
  let dashData = null;
  let claimsData = null;

  // Try API first
  if (caseId) {
    try {
      dashData = await apiRequest(`/cases/${caseId}/dashboard`);
      const rawClaims = await apiRequest(`/cases/${caseId}/claims`);
      claimsData = mapServerClaims(rawClaims);
    } catch (err) {
      console.warn('API unavailable, using demo data:', err.message);
    }
  } else {
    console.warn('No case ID found, using demo data');
  }

  // Map API response to UI format, or fall back to demo
  if (dashData) {
    const mapped = {
      claimsFiled: dashData.claims.done,
      claimsPending: dashData.claims.total - dashData.claims.done,
      claimsTotal: dashData.claims.total,
      claimsProgress: dashData.claims.total > 0 ? Math.round((dashData.claims.done / dashData.claims.total) * 100) : 0,
      docsCollected: dashData.documents.collected,
      docsRemaining: dashData.documents.total - dashData.documents.collected,
      docsTotal: dashData.documents.total,
      docsProgress: dashData.documents.total > 0 ? Math.round((dashData.documents.collected / dashData.documents.total) * 100) : 0,
      amountReceived: 748900, // Not tracked by server yet, use placeholder
      amountEstimated: 1864500,
      amountPercentage: 40,
      nextAction: dashData.nextUrgentAction
        ? { title: dashData.nextUrgentAction, dueInDays: 5, type: 'claim' }
        : DEMO_DASHBOARD.nextAction
    };
    renderStats(mapped);
  } else {
    renderStats(DEMO_DASHBOARD);
  }

  renderClaims(claimsData || DEMO_CLAIMS);
}

// Fallback functions in case shared.js isn't fully loaded or mock needed
if (!window.formatCurrency) {
  window.formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };
}
if (!window.formatDate) {
  window.formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
}

if (window.onReady) {
  window.onReady(() => {
    if (window.initPage) {
      window.initPage('dashboard', {
        greeting: 'Namaste!',
        subtitle: "We're with you in every step of this journey.",
        notificationCount: 3
      });
    }
    loadDashboard();
  });
} else {
  // Fallback if shared.js isn't used
  document.addEventListener('DOMContentLoaded', loadDashboard);
}

// Add event listeners for interactivity
document.addEventListener('click', (e) => {
  if (e.target.closest('.add-claim-link')) {
    e.preventDefault();
    window.location.href = 'claims.html';
  }
  if (e.target.closest('.col-menu')) {
    e.preventDefault();
    window.location.href = 'claims.html';
  }
  if (e.target.closest('.action-btn')) {
    e.preventDefault();
    window.location.href = 'claims.html';
  }
});
