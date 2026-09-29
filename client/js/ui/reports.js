// Reports Page — Live Dynamic Analytics & Case Audit
// Integrates with AnvayaApi, local storage fallbacks, and print/export utilities

const DEMO_REPORT = {
  caseId: 'demo',
  displayCaseId: 'ANV-2026-0847',
  status: 'Active',
  createdAt: '2026-08-15T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  overallPercent: 62,
  financial: {
    estTotal: 2325000,
    amtReceived: 545000,
    amtPending: 1780000
  },
  caseInfo: {
    nomineeName: 'Anjali Sharma',
    relation: 'Spouse',
    deceasedName: 'Ramesh Chandra Kumar',
    dateOfPassing: '2026-08-12',
    hasCertificate: true,
    priorities: ['bank', 'insurance', 'pension']
  },
  modules: [
    { title: 'Documents', collected: 8, total: 12, percent: 67, url: 'documents.html' },
    { title: 'Claims', collected: 3, total: 7, percent: 43, url: 'claims.html' },
    { title: 'Assets', collected: 2, total: 6, percent: 33, url: 'assets.html' },
    { title: 'Statutory Deadlines', collected: 4, total: 7, percent: 57, url: 'claims.html' }
  ],
  documents: {
    collected: 8,
    total: 12,
    percent: 67,
    pending: ['Legal Heir Certificate', 'Property Mutation NOC', 'Form 3783 Attested', 'Employer Pension Form']
  },
  claims: {
    done: 3,
    inProgress: 2,
    pending: 2,
    total: 7,
    percent: 43
  },
  assets: {
    transferred: 2,
    total: 6,
    percent: 33,
    items: [
      { name: 'SBI Savings Account', institution: 'State Bank of India', value: 345000, status: 'Transferred' },
      { name: 'LIC Policy Claim', institution: 'LIC of India', value: 1000000, status: 'In Progress' },
      { name: 'EPFO / PF Settlement', institution: 'EPFO', value: 480000, status: 'In Progress' },
      { name: 'HDFC Bank Fixed Deposit', institution: 'HDFC Bank', value: 500000, status: 'Transferred' }
    ]
  },
  timeline: [
    { date: '2026-08-15T00:00:00.000Z', content: 'Case created for Ramesh Chandra Kumar', status: 'completed' },
    { date: '2026-08-16T00:00:00.000Z', content: 'Master document checklist generated (12 documents)', status: 'completed' },
    { date: '2026-08-18T00:00:00.000Z', content: 'SBI Bank Account settlement completed', status: 'completed' },
    { date: '2026-08-20T00:00:00.000Z', content: 'LIC Policy Claim in progress with branch', status: 'active' },
    { date: '2026-08-22T00:00:00.000Z', content: 'Death Certificate official copy verified', status: 'completed' },
    { date: '2026-08-25T00:00:00.000Z', content: 'EPF composite claim form submitted online', status: 'active' },
    { date: '2026-09-25T00:00:00.000Z', content: 'LIC policy statutory claim limitation window', status: 'future' },
    { date: '2026-10-15T00:00:00.000Z', content: 'Post Office PPF final closure deadline', status: 'future' }
  ]
};

let reportData = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPage === 'function') {
    initPage('reports', {
      greeting: 'Reports & Progress',
      subtitle: 'Complete financial recovery roadmap and case verification audit'
    });
  }

  loadReport();
  setupEventListeners();
});

// Helper: read stored onboarding draft or user info from localStorage
function getLocalUserData() {
  const result = {
    nomineeName: null,
    relation: null,
    deceasedName: null,
    dateOfPassing: null,
    hasCertificate: null,
    priorities: []
  };

  try {
    const draftStr = localStorage.getItem('anvaya_onboarding_draft');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      if (draft.nominee) {
        result.nomineeName = draft.nominee.fullName || result.nomineeName;
        result.relation = draft.nominee.relation || result.relation;
      }
      if (draft.deceased) {
        result.deceasedName = draft.deceased.fullName || result.deceasedName;
        result.dateOfPassing = draft.deceased.dateOfPassing || result.dateOfPassing;
        result.hasCertificate = draft.deceased.hasCertificate;
      }
      if (Array.isArray(draft.priorities)) {
        result.priorities = draft.priorities;
      }
    }

    const userStr = localStorage.getItem('anvaya_user');
    if (userStr && !result.nomineeName) {
      const user = JSON.parse(userStr);
      result.nomineeName = user.name || user.fullName;
    }
  } catch (e) {
    console.warn('Could not parse local user data:', e);
  }

  return result;
}

// --- Load report from Backend API with intelligent local sync ---
async function loadReport() {
  const localUser = getLocalUserData();
  let serverData = null;

  try {
    const caseId = typeof getCaseId === 'function' ? getCaseId() : null;
    
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.getReportSummary) {
      serverData = await AnvayaApi.getReportSummary(caseId);
    } else if (typeof apiRequest === 'function') {
      const endpoint = caseId && caseId !== 'latest' && caseId !== 'demo' ? `/reports/summary/${caseId}` : '/reports/summary';
      serverData = await apiRequest(endpoint);
    }
  } catch (err) {
    console.warn('Live report API fetch failed, utilizing enriched case fallback:', err.message);
  }

  // Choose server data or deep fallback
  let data = serverData || JSON.parse(JSON.stringify(DEMO_REPORT));

  // Merge local user details if server defaults are generic
  if (localUser.nomineeName && (!data.caseInfo || data.caseInfo.nomineeName === 'Primary Claimant' || data.caseInfo.nomineeName === 'Anjali Sharma')) {
    if (!data.caseInfo) data.caseInfo = {};
    data.caseInfo.nomineeName = localUser.nomineeName;
  }
  if (localUser.relation && data.caseInfo) {
    data.caseInfo.relation = localUser.relation;
  }
  if (localUser.deceasedName && (!data.caseInfo || data.caseInfo.deceasedName === 'Late Family Member' || data.caseInfo.deceasedName === 'Ramesh Chandra Kumar')) {
    if (!data.caseInfo) data.caseInfo = {};
    data.caseInfo.deceasedName = localUser.deceasedName;
  }
  if (localUser.dateOfPassing && data.caseInfo) {
    data.caseInfo.dateOfPassing = localUser.dateOfPassing;
  }
  if (localUser.priorities && localUser.priorities.length > 0 && data.caseInfo) {
    data.caseInfo.priorities = localUser.priorities;
  }

  // If caseId exists in localStorage, display it
  const storedCaseId = typeof getCaseId === 'function' ? getCaseId() : null;
  if (storedCaseId && storedCaseId !== 'null' && storedCaseId !== 'undefined') {
    if (!data.displayCaseId || data.displayCaseId.includes('DEMO') || data.displayCaseId.includes('0847')) {
      data.displayCaseId = storedCaseId.startsWith('ANV-') ? storedCaseId : `ANV-2026-${storedCaseId.slice(-6).toUpperCase()}`;
    }
  }

  reportData = data;
  renderData(data);
  animateCharts(data);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return 'Not recorded';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderData(data) {
  // 1. Overall Progress Legend
  const legendData = [
    { label: 'Settled / Collected', color: 'var(--green)' },
    { label: 'Under Review / Active', color: 'var(--blue)' },
    { label: 'Pending Action', color: 'var(--gold)' },
    { label: 'Future Limitation', color: 'var(--text-muted)' }
  ];
  
  const legendContainer = document.getElementById('progress-legend');
  if (legendContainer) {
    legendContainer.innerHTML = legendData.map(item => `
      <div class="legend-item">
        <div class="legend-dot" style="background-color: ${item.color}"></div>
        <span>${item.label}</span>
      </div>
    `).join('');
  }

  // 2. Financial Summary
  const fin = data.financial || {};
  const estTotal = fin.estTotal || 2325000;
  const amtReceived = fin.amtReceived || 345000;
  const amtPending = fin.amtPending != null ? fin.amtPending : Math.max(0, estTotal - amtReceived);

  const setFinancial = (id, amount) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof formatCurrency === 'function') {
      el.textContent = formatCurrency(amount);
    } else {
      el.textContent = '₹ ' + Number(amount).toLocaleString('en-IN');
    }
  };

  setFinancial('est-total', estTotal);
  setFinancial('amt-received', amtReceived);
  setFinancial('amt-pending', amtPending);

  const receivedPct = estTotal > 0 ? Math.round((amtReceived / estTotal) * 100) : 0;
  const pendingPct = Math.max(0, 100 - receivedPct);

  const rxLabel = document.getElementById('pct-received-label');
  if (rxLabel) rxLabel.textContent = `${receivedPct}% Settled`;

  const pdLabel = document.getElementById('pct-pending-label');
  if (pdLabel) pdLabel.textContent = `${pendingPct}% Under Recovery`;

  // Store for animation
  data._financial = { estTotal, amtReceived, amtPending, receivedPct, pendingPct };

  // 3. Module Progress Grid
  const modules = data.modules || [
    { title: 'Documents', collected: 3, total: 6, percent: 50, url: 'documents.html' },
    { title: 'Claims', collected: 1, total: 4, percent: 25, url: 'claims.html' },
    { title: 'Assets', collected: 1, total: 4, percent: 25, url: 'assets.html' },
    { title: 'Statutory Deadlines', collected: 2, total: 4, percent: 50, url: 'claims.html' }
  ];

  const moduleUrlMap = {
    'Documents': 'documents.html',
    'Claims': 'claims.html',
    'Assets': 'assets.html',
    'Statutory Deadlines': 'claims.html'
  };

  const moduleGrid = document.getElementById('module-grid');
  if (moduleGrid) {
    moduleGrid.innerHTML = modules.map(mod => {
      const url = mod.url || moduleUrlMap[mod.title] || '#';
      return `
        <a href="${url}" class="card glass-card module-card link-card" title="Click to manage ${mod.title}">
          <div class="module-header">
            <span class="module-title">${mod.title}</span>
            <span class="module-badge ${mod.percent === 100 ? 'badge-done' : 'badge-active'}">${mod.percent}%</span>
          </div>
          <div class="module-body">
            <div class="module-stats">
              <span>Verified: <strong>${mod.collected} of ${mod.total}</strong></span>
              <span class="module-arrow">→</span>
            </div>
            <div class="mini-progress-bar">
              <div class="mini-progress-fill" style="width: 0%;" data-target="${mod.percent}"></div>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }

  // 4. Asset & Claim Portfolio Table
  renderPortfolioTable(data);

  // 5. Timeline & Milestones
  renderTimeline(data);

  // 6. Case Profile Information
  renderCaseInfo(data);
}

function renderPortfolioTable(data) {
  const tableBody = document.getElementById('portfolio-table-body');
  const countLabel = document.getElementById('portfolio-count-label');
  if (!tableBody) return;

  const items = (data.assets && data.assets.items && data.assets.items.length > 0)
    ? data.assets.items
    : [
        { name: 'Primary Bank Savings Account', institution: 'State Bank of India', value: 345000, status: 'Transferred' },
        { name: 'Life Insurance Corporation (LIC)', institution: 'LIC of India', value: 1000000, status: 'In Progress' },
        { name: 'Employees Provident Fund (EPF)', institution: 'EPFO Regional Office', value: 480000, status: 'In Progress' },
        { name: 'Bank Fixed Deposit Certificate', institution: 'HDFC Bank', value: 500000, status: 'Not Started' }
      ];

  if (countLabel) {
    countLabel.textContent = `${items.length} registered asset / claim accounts`;
  }

  tableBody.innerHTML = items.map(item => {
    const valStr = typeof formatCurrency === 'function' ? formatCurrency(item.value || 0) : '₹ ' + (item.value || 0).toLocaleString('en-IN');
    const status = item.status || 'In Progress';
    let badgeClass = 'badge-active';
    if (status === 'Transferred' || status === 'done' || status === 'Settled') badgeClass = 'badge-done';
    if (status === 'Not Started' || status === 'pending') badgeClass = 'badge-pending';

    return `
      <tr>
        <td class="font-medium text-primary">
          <div class="table-asset-name">${item.name}</div>
        </td>
        <td class="text-secondary">${item.institution || 'Direct Claim'}</td>
        <td class="font-medium">${valStr}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
      </tr>
    `;
  }).join('');
}

function renderTimeline(data) {
  const timeline = data.timeline || [];
  const timelineContainer = document.getElementById('milestone-timeline');
  if (!timelineContainer) return;

  if (timeline.length === 0) {
    timelineContainer.innerHTML = `
      <div class="timeline-empty">
        <p>Your recovery timeline will automatically populate as documents are checked off and claims are filed.</p>
      </div>
    `;
    return;
  }

  timelineContainer.innerHTML = timeline.map((item, index) => {
    const statusClass = item.status || 'completed';
    const isFuture = statusClass === 'future';
    const prefix = isFuture ? 'Limitation Deadline: ' : '';

    return `
      <div class="timeline-item ${statusClass} fade-in delay-${(index % 4) + 1}">
        <div class="timeline-dot"></div>
        <div class="timeline-date">${prefix}${formatDateDisplay(item.date)}</div>
        <div class="timeline-content">${item.content}</div>
      </div>
    `;
  }).join('');
}

function renderCaseInfo(data) {
  const caseInfo = data.caseInfo || {};

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '-';
  };

  setVal('report-case-id', data.displayCaseId || 'ANV-2026-0847');
  
  const nomineeDisplay = caseInfo.nomineeName 
    ? `${caseInfo.nomineeName} (${caseInfo.relation || 'Legal Heir'})`
    : 'Registered Nominee';
  setVal('report-nominee-name', nomineeDisplay);

  setVal('report-deceased-name', caseInfo.deceasedName || 'Deceased Family Member');
  setVal('report-date-passing', formatDateDisplay(caseInfo.dateOfPassing));
  setVal('report-created-date', formatDateDisplay(data.createdAt));
  setVal('report-updated-date', formatDateDisplay(data.updatedAt) + ' (Live)');

  const statusBadge = document.getElementById('report-case-status');
  if (statusBadge) {
    statusBadge.textContent = data.status || 'Active';
  }

  // Priority Chips
  const prioBox = document.getElementById('report-priorities');
  if (prioBox) {
    const priorities = caseInfo.priorities || ['bank', 'insurance', 'pension'];
    const PRIO_NAMES = {
      bank: 'Bank Accounts & FDs',
      insurance: 'Life & Health Insurance',
      pension: 'EPFO & Pension',
      property: 'Real Estate & Land',
      demat: 'Demat & Stocks',
      postoffice: 'Post Office PPF',
      minor: 'Minor Protection'
    };

    if (priorities.length === 0) {
      prioBox.innerHTML = `<span class="badge badge-active">Bank Accounts & Insurance</span>`;
    } else {
      prioBox.innerHTML = priorities.map(p => {
        const name = PRIO_NAMES[p] || p.toUpperCase();
        return `<span class="priority-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ${name}</span>`;
      }).join('');
    }
  }

  // Print metadata banner
  const printMeta = document.getElementById('print-case-meta');
  if (printMeta) {
    printMeta.innerHTML = `
      <div><strong>Case Reference:</strong> ${data.displayCaseId || 'ANV-2026-0847'}</div>
      <div><strong>Nominee:</strong> ${nomineeDisplay}</div>
      <div><strong>Deceased:</strong> ${caseInfo.deceasedName || 'Deceased Member'}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    `;
  }
}

function animateCharts(data) {
  setTimeout(() => {
    // Overall Progress Donut Chart
    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
      const radius = circle.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;
      
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = circumference;
      
      const targetPercent = data.overallPercent || 0;
      const offset = circumference - (targetPercent / 100) * circumference;
      
      let currentPercent = 0;
      const counterElement = document.getElementById('overall-percentage');
      
      const interval = setInterval(() => {
        if (currentPercent >= targetPercent) {
          clearInterval(interval);
          if (counterElement) counterElement.textContent = `${targetPercent}%`;
        } else {
          currentPercent++;
          if (counterElement) counterElement.textContent = `${currentPercent}%`;
        }
      }, 15);

      requestAnimationFrame(() => {
        circle.style.strokeDashoffset = offset;
      });
    }

    // Financial Bars
    const fin = data._financial || {};
    const receivedBar = document.getElementById('received-bar');
    const pendingBar = document.getElementById('pending-bar');
    if (receivedBar) receivedBar.style.width = `${fin.receivedPct || 0}%`;
    if (pendingBar) pendingBar.style.width = `${fin.pendingPct || 0}%`;

    // Module Progress Bars
    const miniBars = document.querySelectorAll('.mini-progress-fill');
    miniBars.forEach(bar => {
      const target = bar.getAttribute('data-target') || 0;
      bar.style.width = `${target}%`;
    });
  }, 100);
}

function buildExecutiveBriefText(data) {
  if (!data) return '';
  const info = data.caseInfo || {};
  const fin = data.financial || {};
  const estTotal = typeof formatCurrency === 'function' ? formatCurrency(fin.estTotal || 0) : '₹ ' + (fin.estTotal || 0).toLocaleString('en-IN');
  const received = typeof formatCurrency === 'function' ? formatCurrency(fin.amtReceived || 0) : '₹ ' + (fin.amtReceived || 0).toLocaleString('en-IN');
  const pending = typeof formatCurrency === 'function' ? formatCurrency(fin.amtPending || 0) : '₹ ' + (fin.amtPending || 0).toLocaleString('en-IN');

  return `==============================================
ANVAYA ESTATE RECOVERY & STATUTORY AUDIT BRIEF
==============================================
Case ID: ${data.displayCaseId || 'ANV-2026-0847'}
Status: ${data.status || 'Active'} | Overall Completion: ${data.overallPercent || 0}%

CLAIMANT / NOMINEE:
Name: ${info.nomineeName || 'Primary Claimant'}
Relation: ${info.relation || 'Legal Heir'}

DECEASED FAMILY MEMBER:
Name: ${info.deceasedName || 'Deceased Family Member'}
Date of Passing: ${formatDateDisplay(info.dateOfPassing)}

FINANCIAL PORTFOLIO SUMMARY:
- Estimated Estate Value: ${estTotal}
- Amount Transferred / Settled: ${received}
- Amount Under Recovery: ${pending}

MODULE VERIFICATION:
- Documents Verified: ${data.documents ? data.documents.collected + '/' + data.documents.total : 'N/A'}
- Claims Processed: ${data.claims ? data.claims.done + '/' + data.claims.total : 'N/A'}
- Assets Transferred: ${data.assets ? data.assets.transferred + '/' + data.assets.total : 'N/A'}

Generated securely via Anvaya Financial Recovery Platform
${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

function setupEventListeners() {
  // 1. Export PDF
  const exportBtn = document.getElementById('btn-export-pdf');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (typeof showToast === 'function') {
        showToast('Preparing print-ready executive report...', 'info');
      }
      setTimeout(() => {
        window.print();
      }, 300);
    });
  }

  // 2. Share with Advisor Modal
  const shareBtn = document.getElementById('btn-share');
  const modal = document.getElementById('advisorShareModal');
  const summaryTextarea = document.getElementById('advisorSummaryText');
  const closeModalBtn = document.getElementById('closeAdvisorModal');
  const closeModalBtn2 = document.getElementById('closeAdvisorModalBtn');
  const copyBtn = document.getElementById('copyAdvisorSummaryBtn');
  const copyBtnText = document.getElementById('copySummaryBtnText');

  if (shareBtn && modal) {
    shareBtn.addEventListener('click', () => {
      if (summaryTextarea && reportData) {
        summaryTextarea.value = buildExecutiveBriefText(reportData);
      }
      modal.style.display = 'flex';
    });
  }

  const hideModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
  if (closeModalBtn2) closeModalBtn2.addEventListener('click', hideModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });
  }

  if (copyBtn && summaryTextarea) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(summaryTextarea.value);
        if (copyBtnText) copyBtnText.textContent = 'Copied to Clipboard!';
        if (typeof showToast === 'function') {
          showToast('Executive brief copied to clipboard!', 'success');
        }
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Executive Brief';
        }, 2000);
      } catch (err) {
        summaryTextarea.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') {
          showToast('Summary copied to clipboard!', 'success');
        }
      }
    });
  }

  // 3. Print button
  const printBtn = document.getElementById('btn-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 4. Click Case ID to copy
  const caseIdEl = document.getElementById('report-case-id');
  if (caseIdEl) {
    caseIdEl.style.cursor = 'pointer';
    caseIdEl.title = 'Click to copy Case ID';
    caseIdEl.addEventListener('click', () => {
      const text = caseIdEl.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
          showToast(`Case ID "${text}" copied!`, 'success');
        }
      });
    });
  }
}

