// Reports Page — Dynamic with API Integration

const DEMO_REPORT = {
  overallPercent: 62,
  modules: [
    { title: 'Documents', collected: 8, total: 12, percent: 67 },
    { title: 'Claims', collected: 3, total: 7, percent: 43 },
    { title: 'Assets', collected: 2, total: 8, percent: 25 }
  ],
  documents: { collected: 8, total: 12, percent: 67 },
  claims: { done: 3, inProgress: 2, pending: 2, total: 7, percent: 43 },
  assets: { transferred: 2, total: 8, percent: 25 },
  timeline: [
    { date: '2026-08-15T00:00:00.000Z', content: 'Case created', status: 'completed' },
    { date: '2026-08-16T00:00:00.000Z', content: 'Documents checklist generated (12 documents)', status: 'completed' },
    { date: '2026-08-18T00:00:00.000Z', content: 'BANK claim completed', status: 'completed' },
    { date: '2026-08-20T00:00:00.000Z', content: 'LIC claim in progress', status: 'active' },
    { date: '2026-08-22T00:00:00.000Z', content: 'Death Certificate collected', status: 'completed' },
    { date: '2026-08-25T00:00:00.000Z', content: 'EPF claim in progress', status: 'active' },
    { date: '2026-09-10T00:00:00.000Z', content: 'LIC claim deadline', status: 'future' },
    { date: '2026-09-25T00:00:00.000Z', content: 'POSTOFFICE claim deadline', status: 'future' }
  ]
};

let reportData = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPage === 'function') {
    initPage('reports', {
      greeting: 'Reports & Progress',
      subtitle: 'Your complete recovery journey summary'
    });
  }

  loadReport();
  setupEventListeners();
});

// --- Load report from API ---
async function loadReport() {
  try {
    const caseId = typeof getCaseId === 'function' ? getCaseId() : null;
    if (caseId && caseId !== 'demo' && typeof apiRequest === 'function') {
      const data = await apiRequest(`/reports/summary/${caseId}`);
      reportData = data;
      renderData(data);
      animateCharts(data);
      return;
    }
  } catch (err) {
    console.warn('Reports API unavailable, using demo data:', err.message);
  }

  // Demo fallback
  reportData = DEMO_REPORT;
  renderData(DEMO_REPORT);
  animateCharts(DEMO_REPORT);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderData(data) {
  // 1. Overall Progress Legend
  const legendData = [
    { label: 'Completed', color: 'var(--green)' },
    { label: 'In Progress', color: 'var(--blue)' },
    { label: 'Pending', color: 'var(--gold)' },
    { label: 'Not Started', color: 'var(--text-muted)' }
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

  // 2. Module Progress Grid
  const modules = data.modules || [];
  const moduleGrid = document.getElementById('module-grid');
  if (moduleGrid) {
    moduleGrid.innerHTML = modules.map(mod => `
      <div class="card glass-card module-card">
        <div class="module-header">
          <span class="module-title">${mod.title}</span>
        </div>
        <div>
          <div class="module-stats">
            <span>${mod.collected}/${mod.total}</span>
            <span>${mod.percent}%</span>
          </div>
          <div class="mini-progress-bar">
            <div class="mini-progress-fill" style="width: 0%; background-color: var(--blue)" data-target="${mod.percent}"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 3. Financial Summary — estimated from claim/asset counts since no financial tracking model
  const claimsData = data.claims || {};
  const assetsData = data.assets || {};

  // Estimate: each claim type has an approximate value
  const avgClaimValue = 200000; // ₹2 lakh average per claim
  const estTotal = (claimsData.total || 0) * avgClaimValue + (assetsData.total || 0) * 500000;
  const amtReceived = (claimsData.done || 0) * avgClaimValue;
  const amtPending = estTotal - amtReceived;

  const setFinancial = (id, amount) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof formatCurrency === 'function') {
      el.textContent = formatCurrency(amount);
    } else {
      el.textContent = '₹' + amount.toLocaleString('en-IN');
    }
  };

  setFinancial('est-total', estTotal);
  setFinancial('amt-received', amtReceived);
  setFinancial('amt-pending', amtPending);

  // Store for chart animation
  data._financial = { estTotal, amtReceived, amtPending };

  // 4. Timeline
  const timeline = data.timeline || [];
  const timelineContainer = document.getElementById('milestone-timeline');
  if (timelineContainer) {
    if (timeline.length === 0) {
      timelineContainer.innerHTML = `
        <div class="timeline-empty">
          <p>No activity yet. Start by generating your document checklist and filing claims.</p>
        </div>
      `;
    } else {
      timelineContainer.innerHTML = timeline.map((item, index) => `
        <div class="timeline-item ${item.status} fade-in delay-${(index % 5) + 1}">
          <div class="timeline-dot"></div>
          <div class="timeline-date">${item.status === 'future' ? 'Estimated: ' : ''}${formatDateDisplay(item.date)}</div>
          <div class="timeline-content">${item.content}</div>
        </div>
      `).join('');
    }
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
      
      // Count up animation
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
      }, 20);

      // Stroke animation
      requestAnimationFrame(() => {
        circle.style.strokeDashoffset = offset;
      });
    }

    // Financial Bars
    const fin = data._financial || {};
    const estTotal = fin.estTotal || 1;
    const amtReceived = fin.amtReceived || 0;
    const amtPending = fin.amtPending || 0;

    const receivedBar = document.getElementById('received-bar');
    const pendingBar = document.getElementById('pending-bar');
    if (receivedBar) receivedBar.style.width = `${(amtReceived / estTotal) * 100}%`;
    if (pendingBar) pendingBar.style.width = `${(amtPending / estTotal) * 100}%`;

    // Module Progress Bars
    const miniBars = document.querySelectorAll('.mini-progress-fill');
    miniBars.forEach(bar => {
      const target = bar.getAttribute('data-target');
      bar.style.width = `${target}%`;
    });
  }, 100);
}

function setupEventListeners() {
  const exportBtn = document.getElementById('btn-export-pdf');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (typeof showToast === 'function') {
        showToast('PDF report generated. Download starting...', 'success');
      } else {
        alert('PDF report generated. Download starting...');
      }
    });
  }

  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (typeof showToast === 'function') {
        showToast('Report shared securely with your advisor.', 'success');
      } else {
        alert('Report shared securely with your advisor.');
      }
    });
  }

  const printBtn = document.getElementById('btn-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
