// Assets Page Logic — Connected to Backend API
// Uses AnvayaApi from api/anvayaApi.js + apiRequest from shared.js

// Demo fallback data (used when API is offline)
const DEMO_ASSETS = [
  {
    id: 'a1',
    name: 'SBI Savings Account XXXX4521',
    value: 345000,
    status: 'Transferred',
    institution: 'State Bank of India',
    type: 'Bank Accounts',
    icon: 'bank',
    progress: 100,
    docsReq: 4,
    docsSubmitted: 4,
    assetType: 'bank'
  },
  {
    id: 'a2',
    name: 'LIC Policy #98765432',
    value: 1000000,
    status: 'In Progress',
    institution: 'Life Insurance Corporation',
    type: 'Others',
    icon: 'clipboard',
    progress: 60,
    docsReq: 5,
    docsSubmitted: 3,
    assetType: null
  },
  {
    id: 'a3',
    name: 'Flat in Sector 62, Noida',
    value: 8500000,
    status: 'Not Started',
    institution: 'Real Estate',
    type: 'Property',
    icon: 'house',
    progress: 0,
    docsReq: 8,
    docsSubmitted: 0,
    assetType: 'property'
  },
  {
    id: 'a4',
    name: 'SBI FD XXXX1234',
    value: 500000,
    status: 'Documents Submitted',
    institution: 'State Bank of India',
    type: 'Fixed Deposits',
    icon: 'money',
    progress: 30,
    docsReq: 3,
    docsSubmitted: 3,
    assetType: 'bank'
  },
  {
    id: 'a5',
    name: 'Zerodha Demat',
    value: 230000,
    status: 'In Progress',
    institution: 'Zerodha',
    type: 'Stocks/MF',
    icon: 'chart',
    progress: 45,
    docsReq: 4,
    docsSubmitted: 2,
    assetType: 'demat'
  },
  {
    id: 'a6',
    name: 'Gold (Physical)',
    value: 450000,
    status: 'Not Started',
    institution: 'Home Safe',
    type: 'Gold',
    icon: 'coin',
    progress: 0,
    docsReq: 2,
    docsSubmitted: 0,
    assetType: null
  },
  {
    id: 'a7',
    name: 'PPF Account',
    value: 1200000,
    status: 'Under Review',
    institution: 'Post Office',
    type: 'Others',
    icon: 'document',
    progress: 75,
    docsReq: 5,
    docsSubmitted: 5,
    assetType: null
  },
  {
    id: 'a8',
    name: 'Maruti Swift DZire',
    value: 380000,
    status: 'Not Started',
    institution: 'RTO',
    type: 'Vehicles',
    icon: 'car',
    progress: 0,
    docsReq: 4,
    docsSubmitted: 0,
    assetType: null
  }
];

let assetsData = [...DEMO_ASSETS];
let currentFilter = 'All';
let currentSort = 'value-desc';

// ─── Transfer guide cache ──────────────────────────────────
const transferGuideCache = {};

// ─── Initialize ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPage === 'function') {
    initPage('assets', {
      greeting: 'Asset Transfer',
      subtitle: 'Track and manage all discovered assets'
    });
  }

  setupEventListeners();
  renderAssets();
  updateStats();
  preloadTransferGuides();
});

// ─── Preload transfer guides from backend ──────────────────
async function preloadTransferGuides() {
  const types = ['property', 'demat', 'bank', 'locker'];
  for (const type of types) {
    try {
      const data = await AnvayaApi.getTransferSteps(type);
      transferGuideCache[type] = data.steps || [];
    } catch (err) {
      console.warn(`Could not load transfer guide for ${type}:`, err.message);
    }
  }
}

// ─── Event Listeners ───────────────────────────────────────
function setupEventListeners() {
  // Filters
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderAssets();
    });
  });

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderAssets();
    });
  }

  // Add Button
  const btnAdd = document.getElementById('btn-add-asset');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (typeof showToast === 'function') {
        showToast('Feature coming soon — asset discovery will be automated', 'info');
      }
    });
  }

  // Delegate click on transfer guide / locker alert buttons
  document.addEventListener('click', async (e) => {
    const guideBtn = e.target.closest('.btn-transfer-guide');
    if (guideBtn) {
      const assetType = guideBtn.dataset.assetType;
      await showTransferGuide(assetType, guideBtn);
      return;
    }

    const lockerBtn = e.target.closest('.btn-locker-alert');
    if (lockerBtn) {
      await showLockerAlert(lockerBtn);
      return;
    }

    const liabilityBtn = e.target.closest('.btn-liability-check');
    if (liabilityBtn) {
      const loanType = liabilityBtn.dataset.loanType;
      await showLiabilityInfo(loanType, liabilityBtn);
      return;
    }
  });
}

// ─── Transfer Guide (from backend) ────────────────────────
async function showTransferGuide(assetType, btn) {
  if (!assetType) {
    showToast('No transfer guide available for this asset type', 'info');
    return;
  }

  // Check cache first
  let steps = transferGuideCache[assetType];

  if (!steps) {
    try {
      btn.textContent = 'Loading...';
      btn.disabled = true;
      const data = await AnvayaApi.getTransferSteps(assetType);
      steps = data.steps || [];
      transferGuideCache[assetType] = steps;
    } catch (err) {
      showToast('Could not load transfer guide — server may be offline', 'error');
      btn.textContent = 'Transfer Guide';
      btn.disabled = false;
      return;
    }
  }

  btn.textContent = 'Transfer Guide';
  btn.disabled = false;

  // Show steps in a modal-style overlay
  showGuideModal(`Transfer Guide: ${assetType.charAt(0).toUpperCase() + assetType.slice(1)}`, steps);
}

// ─── Locker Alert (from backend) ───────────────────────────
async function showLockerAlert(btn) {
  // Use the deceased's date of death from user data, or fallback to a recent date
  const user = typeof getUser === 'function' ? getUser() : null;
  const deathDate = (user && user.deceased && user.deceased.dod)
    ? user.deceased.dod
    : new Date(Date.now() - 5 * 86400000).toISOString(); // 5 days ago as demo

  try {
    btn.textContent = 'Checking...';
    btn.disabled = true;
    const data = await AnvayaApi.getLockerAlert(deathDate);

    const urgency = data.urgent ? '🚨 URGENT' : '⏳ Note';
    const steps = data.steps || [];
    const daysMsg = data.daysLeft > 0
      ? `${data.daysLeft} days left before bank seals the locker`
      : 'Locker seal deadline has passed — contact bank immediately';

    showGuideModal(`${urgency} — Bank Locker Alert`, [`${daysMsg}`, ...steps]);
  } catch (err) {
    showToast('Could not check locker status — server may be offline', 'error');
  } finally {
    btn.textContent = 'Locker Alert';
    btn.disabled = false;
  }
}

// ─── Liability Check (from backend) ───────────────────────
async function showLiabilityInfo(loanType, btn) {
  if (!loanType) {
    showToast('Select a loan type to check liability', 'info');
    return;
  }

  try {
    btn.textContent = 'Checking...';
    btn.disabled = true;
    const data = await AnvayaApi.checkLiability(loanType);
    const liable = data.familyLiable ? '⚠️ Family IS liable' : '✅ Family is NOT liable';
    showGuideModal(`Loan Liability: ${loanType}`, [liable, data.note]);
  } catch (err) {
    showToast('Could not check liability — server may be offline', 'error');
  } finally {
    btn.textContent = 'Check Liability';
    btn.disabled = false;
  }
}

// ─── Guide Modal ───────────────────────────────────────────
function showGuideModal(title, steps) {
  // Remove existing modal if any
  const existing = document.getElementById('guide-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'guide-modal-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(11,40,84,0.6);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:var(--glass-bg,#f8f9f1);border-radius:var(--radius-lg,16px);padding:2rem;max-width:520px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow-elevated,0 8px 32px rgba(0,0,0,0.2));';

  const stepsHtml = steps.map((s, i) => `
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
      <div style="min-width:28px;height:28px;border-radius:50%;background:var(--blue,#2576A6);color:white;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;">${i + 1}</div>
      <p style="margin:0;line-height:1.5;color:var(--text-primary,#1a1a2e);">${s}</p>
    </div>
  `).join('');

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <h3 style="margin:0;color:var(--navy,#0B2854);font-size:1.15rem;">${title}</h3>
      <button id="close-guide-modal" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted,#666);line-height:1;">&times;</button>
    </div>
    ${stepsHtml}
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close handlers
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  modal.querySelector('#close-guide-modal').addEventListener('click', () => overlay.remove());
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

// ─── Status Helpers ────────────────────────────────────────
function getStatusBadgeClass(status) {
  switch (status) {
    case 'Transferred': return 'badge-completed';
    case 'In Progress': return 'badge-progress';
    case 'Documents Submitted': return 'badge-pending';
    case 'Under Review': return 'badge-pending';
    case 'Not Started': return 'badge-pending';
    default: return 'badge-pending';
  }
}

function getProgressBarClass(status) {
  switch (status) {
    case 'Transferred': return 'transferred';
    case 'In Progress': return 'in-progress';
    case 'Documents Submitted': return 'documents-submitted';
    case 'Under Review': return 'under-review';
    case 'Not Started': return 'not-started';
    default: return 'not-started';
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// ─── Render Assets ─────────────────────────────────────────
function renderAssets() {
  const grid = document.getElementById('assets-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // Filter
  let filtered = assetsData.filter(asset => {
    if (currentFilter === 'All') return true;
    return asset.type === currentFilter;
  });

  // Sort
  filtered.sort((a, b) => {
    if (currentSort === 'value-desc') return b.value - a.value;
    if (currentSort === 'value-asc') return a.value - b.value;
    if (currentSort === 'status') return a.status.localeCompare(b.status);
    if (currentSort === 'type') return a.type.localeCompare(b.type);
    return 0;
  });

  // Render
  filtered.forEach((asset, index) => {
    const card = document.createElement('div');
    card.className = 'asset-card fade-in';
    card.style.animationDelay = `${index * 0.1}s`;

    // Build action buttons based on asset type
    let actionButtons = '<button class="btn btn-ghost btn-sm">View Details</button>';

    if (asset.assetType) {
      actionButtons += ` <button class="btn btn-ghost btn-sm btn-transfer-guide" data-asset-type="${asset.assetType}">Transfer Guide</button>`;
    }

    if (asset.assetType === 'locker' || asset.type === 'Others' && asset.name.toLowerCase().includes('locker')) {
      actionButtons += ' <button class="btn btn-ghost btn-sm btn-locker-alert">Locker Alert</button>';
    }

    card.innerHTML = `
      <div class="asset-details">
        <div class="asset-header">
          <div class="asset-type-icon">${asset.icon}</div>
          <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status}</span>
        </div>
        <h4 class="asset-name">${asset.name}</h4>
        <div class="asset-inst">${asset.institution}</div>
        <div class="asset-value">${formatCurrency(asset.value)}</div>
        
        <div class="asset-progress-container">
          <div class="progress-header">
            <span>Transfer Progress</span>
            <span>${asset.progress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${getProgressBarClass(asset.status)}" data-width="${asset.progress}%"></div>
          </div>
        </div>
        <div class="docs-count">
          Docs: ${asset.docsSubmitted}/${asset.docsReq}
        </div>
      </div>
      <div class="asset-footer">
        ${actionButtons}
      </div>
    `;

    grid.appendChild(card);
  });

  // Animate progress bars after short delay
  setTimeout(() => {
    const bars = document.querySelectorAll('.progress-bar-fill');
    bars.forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 100);
}

// ─── Update Stats ──────────────────────────────────────────
function updateStats() {
  let totalCount = assetsData.length;
  let transferred = assetsData.filter(a => a.status === 'Transferred').length;
  let inProgress = assetsData.filter(a => a.status === 'In Progress' || a.status === 'Under Review' || a.status === 'Documents Submitted').length;
  let pending = assetsData.filter(a => a.status === 'Not Started').length;
  
  let totalValue = assetsData.reduce((sum, asset) => sum + asset.value, 0);

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  setEl('total-assets-count', totalCount);
  setEl('transferred-count', transferred);
  setEl('in-progress-count', inProgress);
  setEl('pending-count', pending);
  
  const totalValueEl = document.getElementById('total-portfolio-value');
  if (totalValueEl) {
    totalValueEl.innerText = formatCurrency(totalValue);
  }
}
