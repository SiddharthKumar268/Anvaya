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
// ─── Initialize ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPage === 'function') {
    initPage('assets', {
      greeting: 'Asset Transfer',
      subtitle: 'Track and manage all discovered assets'
    });
  }

  setupEventListeners();
  loadAssets();
  preloadTransferGuides();
});

function getIconForType(type) {
  const map = {
    'Bank Accounts': 'bank',
    'Property': 'house',
    'Stocks/MF': 'chart',
    'Fixed Deposits': 'money',
    'Gold': 'coin',
    'Vehicles': 'car',
    'Others': 'clipboard'
  };
  return map[type] || 'document';
}

function getAssetTransferType(type, category) {
  if (category && ['bank', 'property', 'demat', 'locker'].includes(category)) return category;
  const map = {
    'Bank Accounts': 'bank',
    'Property': 'property',
    'Stocks/MF': 'demat',
    'Fixed Deposits': 'bank'
  };
  return map[type] || null;
}

// ─── Load Assets (Backend API with Demo Fallback) ───────────
async function loadAssets() {
  try {
    const caseId = typeof getCaseId === 'function' ? getCaseId() : null;
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.getAssets) {
      const serverAssets = await AnvayaApi.getAssets(caseId);
      if (Array.isArray(serverAssets) && serverAssets.length > 0) {
        assetsData = serverAssets.map(a => mapServerAsset(a));
        renderAssets();
        updateStats();
        return;
      }
    }
  } catch (err) {
    console.warn('Failed to load assets from server, falling back to demo assets:', err.message);
  }
  // Fallback to demo assets
  assetsData = [...DEMO_ASSETS];
  renderAssets();
  updateStats();
}

function mapServerAsset(serverAsset) {
  return {
    id: serverAsset._id || serverAsset.id,
    name: serverAsset.name,
    value: serverAsset.approximateValue || 0,
    status: serverAsset.transferStatus || 'Not Started',
    institution: serverAsset.institution || '',
    accountNumber: serverAsset.accountNumber || '',
    type: serverAsset.type || 'Others',
    icon: getIconForType(serverAsset.type),
    progress: serverAsset.progress || 0,
    docsReq: serverAsset.docsReq || 3,
    docsSubmitted: serverAsset.docsSubmitted || 0,
    assetType: getAssetTransferType(serverAsset.type, serverAsset.category),
    hasNomination: serverAsset.hasNomination !== undefined ? serverAsset.hasNomination : true
  };
}

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

  // Add Asset Button — opens Add Asset Modal
  const btnAdd = document.getElementById('btn-add-asset');
  if (btnAdd) {
    btnAdd.addEventListener('click', openAddAssetModal);
  }

  // Add Asset Modal close and cancel
  const closeAddBtn = document.getElementById('closeAddAssetModal');
  const cancelAddBtn = document.getElementById('cancelAddAssetBtn');
  if (closeAddBtn) closeAddBtn.addEventListener('click', closeAddAssetModal);
  if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddAssetModal);

  const addModalOverlay = document.getElementById('addAssetModal');
  if (addModalOverlay) {
    addModalOverlay.addEventListener('click', (e) => {
      if (e.target === addModalOverlay) closeAddAssetModal();
    });
  }

  // Add Asset Form submit
  const addForm = document.getElementById('addAssetForm');
  if (addForm) {
    addForm.addEventListener('submit', handleAddAssetSubmit);
  }

  // Details Modal close and actions
  const closeDetailBtn = document.getElementById('closeAssetDetailModal');
  const closeDetailBtn2 = document.getElementById('closeDetailModalBtn');
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeAssetDetails);
  if (closeDetailBtn2) closeDetailBtn2.addEventListener('click', closeAssetDetails);

  const detailModalOverlay = document.getElementById('assetDetailModal');
  if (detailModalOverlay) {
    detailModalOverlay.addEventListener('click', (e) => {
      if (e.target === detailModalOverlay) closeAssetDetails();
    });
  }

  const btnUpdateStatus = document.getElementById('btnUpdateStatusModal');
  if (btnUpdateStatus) btnUpdateStatus.addEventListener('click', handleUpdateStatusModal);

  const btnDelete = document.getElementById('btnDeleteAsset');
  if (btnDelete) btnDelete.addEventListener('click', handleDeleteAssetModal);

  // Delegate click on transfer guide / details / locker alert buttons
  document.addEventListener('click', async (e) => {
    const detailsBtn = e.target.closest('.btn-view-details');
    if (detailsBtn) {
      const assetId = detailsBtn.dataset.assetId;
      openAssetDetails(assetId);
      return;
    }

    const draftBtn = e.target.closest('.btn-draft-letter');
    if (draftBtn) {
      const assetId = draftBtn.dataset.assetId;
      openAiLetterModal(assetId);
      return;
    }

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

  // Card action menu delegation (3-dots)
  document.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('.asset-menu-btn');

    // Close all open dropdowns except the one being clicked
    document.querySelectorAll('.asset-dropdown.open').forEach(dd => {
      if (menuBtn && dd === menuBtn.nextElementSibling) return;
      dd.classList.remove('open');
    });

    if (menuBtn) {
      e.stopPropagation();
      const dropdown = menuBtn.nextElementSibling;
      if (dropdown && dropdown.classList.contains('asset-dropdown')) {
        dropdown.classList.toggle('open');
      }
    }
  });

  // Quick delete button delegation
  document.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-quick-delete');
    if (delBtn) {
      e.stopPropagation();
      quickDeleteAsset(delBtn.dataset.assetId);
    }
  });

  // AI Letter Modal listeners
  const closeAiLetterBtn = document.getElementById('closeAiLetterModal');
  const closeAiLetterBtn2 = document.getElementById('closeAiLetterModalBtn');
  if (closeAiLetterBtn) closeAiLetterBtn.addEventListener('click', closeAiLetterModal);
  if (closeAiLetterBtn2) closeAiLetterBtn2.addEventListener('click', closeAiLetterModal);

  const aiLetterOverlay = document.getElementById('aiLetterModal');
  if (aiLetterOverlay) {
    aiLetterOverlay.addEventListener('click', (e) => {
      if (e.target === aiLetterOverlay) closeAiLetterModal();
    });
  }

  const btnGenLetter = document.getElementById('btnGenerateLetter');
  if (btnGenLetter) btnGenLetter.addEventListener('click', handleGenerateAiLetter);

  const btnCopyLetter = document.getElementById('btnCopyLetter');
  if (btnCopyLetter) btnCopyLetter.addEventListener('click', handleCopyAiLetter);

  const btnPrintLetter = document.getElementById('btnPrintLetter');
  if (btnPrintLetter) btnPrintLetter.addEventListener('click', handlePrintAiLetter);

  const btnDraftFromDetails = document.getElementById('btnDraftLetterFromDetails');
  if (btnDraftFromDetails) {
    btnDraftFromDetails.addEventListener('click', () => {
      const assetId = selectedAssetId;
      closeAssetDetails();
      if (assetId) openAiLetterModal(assetId);
    });
  }
}

// ─── Modal Functions: Add Asset ────────────────────────────
function openAddAssetModal() {
  const modal = document.getElementById('addAssetModal');
  if (!modal) return;
  modal.style.display = 'flex';

  const nameInput = document.getElementById('newAssetName');
  const typeInput = document.getElementById('newAssetType');
  const instInput = document.getElementById('newAssetInst');
  const valInput = document.getElementById('newAssetValue');
  const accInput = document.getElementById('newAssetAcc');
  const statusInput = document.getElementById('newAssetStatus');
  const nomInput = document.getElementById('newAssetNomination');
  const reqInput = document.getElementById('newAssetDocsReq');
  const subInput = document.getElementById('newAssetDocsSubmitted');

  if (nameInput) nameInput.value = '';
  if (typeInput) typeInput.value = 'Bank Accounts';
  if (instInput) instInput.value = '';
  if (valInput) valInput.value = '';
  if (accInput) accInput.value = '';
  if (statusInput) statusInput.value = 'Not Started';
  if (nomInput) nomInput.value = 'true';
  if (reqInput) reqInput.value = '4';
  if (subInput) subInput.value = '0';
}

function closeAddAssetModal() {
  const modal = document.getElementById('addAssetModal');
  if (modal) modal.style.display = 'none';
}

async function handleAddAssetSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('newAssetName').value.trim();
  const type = document.getElementById('newAssetType').value;
  const institution = document.getElementById('newAssetInst').value.trim();
  const value = parseFloat(document.getElementById('newAssetValue').value) || 0;
  const accountNumber = document.getElementById('newAssetAcc').value.trim();
  const status = document.getElementById('newAssetStatus').value;
  const hasNomination = document.getElementById('newAssetNomination').value === 'true';
  const docsReq = parseInt(document.getElementById('newAssetDocsReq').value) || 3;
  const docsSubmitted = parseInt(document.getElementById('newAssetDocsSubmitted').value) || 0;

  if (!name) {
    if (typeof showToast === 'function') showToast('Please enter an asset name', 'warning');
    return;
  }

  let progress = 0;
  if (status === 'Transferred') {
    progress = 100;
  } else if (docsReq > 0 && docsSubmitted > 0) {
    progress = Math.min(100, Math.round((docsSubmitted / docsReq) * 100));
  }

  const newAssetObj = {
    id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    name,
    value,
    status,
    institution: institution || 'Self / Direct',
    accountNumber,
    type,
    icon: getIconForType(type),
    progress,
    docsReq,
    docsSubmitted,
    assetType: getAssetTransferType(type),
    hasNomination
  };

  // Optimistic UI update
  assetsData.unshift(newAssetObj);
  renderAssets();
  updateStats();
  closeAddAssetModal();

  if (typeof showToast === 'function') {
    showToast(`Asset "${name}" added successfully!`, 'success');
  }

  // Persist to backend if connected
  try {
    const caseId = typeof getCaseId === 'function' ? getCaseId() : null;
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.createAsset) {
      const serverRes = await AnvayaApi.createAsset({
        caseId,
        name,
        type,
        institution,
        approximateValue: value,
        accountNumber,
        transferStatus: status,
        hasNomination,
        docsReq,
        docsSubmitted
      });
      if (serverRes && serverRes._id) {
        newAssetObj.id = serverRes._id;
      }
    }
  } catch (err) {
    console.warn('Asset saved locally (server offline or demo mode):', err.message);
  }
}

// ─── Modal Functions: Asset Details & Status Update ────────
let selectedAssetId = null;

function openAssetDetails(assetId) {
  const asset = assetsData.find(a => a.id === assetId || String(a.id) === String(assetId));
  if (!asset) return;

  selectedAssetId = asset.id;
  const modal = document.getElementById('assetDetailModal');
  const title = document.getElementById('detailModalTitle');
  const body = document.getElementById('detailModalBody');
  if (!modal || !body) return;

  if (title) title.textContent = asset.name;

  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-cool,#f0f4f8); padding:12px 16px; border-radius:8px;">
      <div>
        <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted,#666); font-weight:600;">Estimated Valuation</div>
        <div style="font-size:1.25rem; font-weight:700; color:var(--navy,#0A192F);">${formatCurrency(asset.value)}</div>
      </div>
      <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status}</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:6px;">
      <div style="background:var(--surface,#fff); border:1px solid var(--border,#e2e8f0); padding:10px; border-radius:8px;">
        <div style="font-size:11px; color:var(--text-muted,#666);">Category</div>
        <div style="font-weight:600; font-size:13px; color:var(--navy,#0A192F);">${asset.type}</div>
      </div>
      <div style="background:var(--surface,#fff); border:1px solid var(--border,#e2e8f0); padding:10px; border-radius:8px;">
        <div style="font-size:11px; color:var(--text-muted,#666);">Institution</div>
        <div style="font-weight:600; font-size:13px; color:var(--navy,#0A192F);">${asset.institution || 'N/A'}</div>
      </div>
      <div style="background:var(--surface,#fff); border:1px solid var(--border,#e2e8f0); padding:10px; border-radius:8px;">
        <div style="font-size:11px; color:var(--text-muted,#666);">Account / Ref</div>
        <div style="font-weight:600; font-size:13px; color:var(--navy,#0A192F);">${asset.accountNumber || 'N/A'}</div>
      </div>
      <div style="background:var(--surface,#fff); border:1px solid var(--border,#e2e8f0); padding:10px; border-radius:8px;">
        <div style="font-size:11px; color:var(--text-muted,#666);">Nomination</div>
        <div style="font-weight:600; font-size:13px; color:${asset.hasNomination ? 'var(--green-dark,#276749)' : 'var(--red,#c53030)'};">${asset.hasNomination ? '✓ Registered' : '⚠ No Nominee'}</div>
      </div>
    </div>

    <div style="margin-top:8px;">
      <label style="display:block; font-size:12px; font-weight:600; color:var(--navy,#0A192F); margin-bottom:4px;" for="detailStatusSelect">Update Transfer Status</label>
      <select id="detailStatusSelect" style="width:100%; padding:8px 12px; border:1px solid var(--border,#e2e8f0); border-radius:8px; font-size:13px;">
        <option value="Not Started" ${asset.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
        <option value="In Progress" ${asset.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Documents Submitted" ${asset.status === 'Documents Submitted' ? 'selected' : ''}>Documents Submitted</option>
        <option value="Under Review" ${asset.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
        <option value="Transferred" ${asset.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
      </select>
    </div>

    <div style="margin-top:6px; font-size:12px; color:var(--text-muted,#666);">
      Documentation: <strong>${asset.docsSubmitted}</strong> of <strong>${asset.docsReq}</strong> verified (${asset.progress}% complete)
    </div>
  `;

  modal.style.display = 'flex';
}

function closeAssetDetails() {
  const modal = document.getElementById('assetDetailModal');
  if (modal) modal.style.display = 'none';
  selectedAssetId = null;
}

async function handleUpdateStatusModal() {
  if (!selectedAssetId) return;
  const asset = assetsData.find(a => a.id === selectedAssetId || String(a.id) === String(selectedAssetId));
  if (!asset) return;

  const select = document.getElementById('detailStatusSelect');
  const newStatus = select ? select.value : asset.status;
  asset.status = newStatus;

  if (newStatus === 'Transferred') {
    asset.progress = 100;
    asset.docsSubmitted = asset.docsReq;
  } else if (newStatus === 'In Progress' && asset.progress === 0) {
    asset.progress = 50;
  }

  renderAssets();
  updateStats();
  closeAssetDetails();

  if (typeof showToast === 'function') showToast(`Status updated to "${newStatus}"`, 'success');

  // Sync to backend if ObjectId
  try {
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.updateAsset && !String(selectedAssetId).startsWith('local_')) {
      await AnvayaApi.updateAsset(selectedAssetId, {
        transferStatus: newStatus,
        progress: asset.progress,
        docsSubmitted: asset.docsSubmitted
      });
    }
  } catch (err) {
    console.warn('Status updated locally:', err.message);
  }
}

async function handleDeleteAssetModal() {
  if (!selectedAssetId) return;
  const assetIndex = assetsData.findIndex(a => a.id === selectedAssetId || String(a.id) === String(selectedAssetId));
  if (assetIndex === -1) return;

  const assetName = assetsData[assetIndex].name;
  if (!confirm(`Are you sure you want to remove "${assetName}" from your assets list?`)) {
    return;
  }
  const idToDelete = selectedAssetId;

  assetsData.splice(assetIndex, 1);
  renderAssets();
  updateStats();
  closeAssetDetails();

  if (typeof showToast === 'function') showToast(`Asset "${assetName}" removed`, 'info');

  try {
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.deleteAsset && !String(idToDelete).startsWith('local_')) {
      await AnvayaApi.deleteAsset(idToDelete);
    }
  } catch (err) {
    console.warn('Deleted locally:', err.message);
  }
}

// ─── Quick Actions (from 3-Dots Menu) ──────────────────────
window.quickUpdateAssetStatus = async function(assetId, newStatus) {
  const asset = assetsData.find(a => a.id === assetId || String(a.id) === String(assetId));
  if (!asset) return;

  asset.status = newStatus;
  if (newStatus === 'Transferred') {
    asset.progress = 100;
    asset.docsSubmitted = asset.docsReq;
  } else if (newStatus === 'In Progress' && asset.progress === 0) {
    asset.progress = 50;
  }

  document.querySelectorAll('.asset-dropdown.open').forEach(dd => dd.classList.remove('open'));

  renderAssets();
  updateStats();

  if (typeof showToast === 'function') showToast(`Status updated to "${newStatus}"`, 'success');

  try {
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.updateAsset && !String(assetId).startsWith('local_')) {
      await AnvayaApi.updateAsset(assetId, {
        transferStatus: newStatus,
        progress: asset.progress,
        docsSubmitted: asset.docsSubmitted
      });
    }
  } catch (err) {
    console.warn('Updated locally:', err.message);
  }
};

window.quickDeleteAsset = async function(assetId) {
  const assetIndex = assetsData.findIndex(a => a.id === assetId || String(a.id) === String(assetId));
  if (assetIndex === -1) return;

  const assetName = assetsData[assetIndex].name;
  if (!confirm(`Are you sure you want to remove "${assetName}" from your assets list?`)) {
    return;
  }

  document.querySelectorAll('.asset-dropdown.open').forEach(dd => dd.classList.remove('open'));

  assetsData.splice(assetIndex, 1);
  renderAssets();
  updateStats();

  if (typeof showToast === 'function') showToast(`Asset "${assetName}" removed`, 'info');

  try {
    if (typeof AnvayaApi !== 'undefined' && AnvayaApi.deleteAsset && !String(assetId).startsWith('local_')) {
      await AnvayaApi.deleteAsset(assetId);
    }
  } catch (err) {
    console.warn('Deleted locally:', err.message);
  }
};

// ─── AI Legal Letter Drafter Modal Functions ──────────────
let currentAiLetterAssetId = null;

window.openAiLetterModal = function(assetId) {
  const asset = assetsData.find(a => a.id === assetId || String(a.id) === String(assetId));
  if (!asset) return;

  currentAiLetterAssetId = asset.id;
  const modal = document.getElementById('aiLetterModal');
  const summaryBox = document.getElementById('aiLetterAssetSummary');
  const typeSelect = document.getElementById('letterTypeSelect');
  const loading = document.getElementById('aiLetterLoading');
  const outputSection = document.getElementById('aiLetterOutputSection');

  if (!modal) return;

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div>
        <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted,#666); font-weight:600;">Target Asset</div>
        <div style="font-weight:700; color:var(--navy,#0A192F); font-size:14px;">${asset.name} (${asset.type})</div>
      </div>
      <div>
        <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted,#666); font-weight:600;">Institution / A/c</div>
        <div style="font-weight:600; color:var(--navy,#0A192F); font-size:13px;">${asset.institution || 'Direct'} — ${asset.accountNumber || 'N/A'}</div>
      </div>
      <div>
        <div style="font-size:11px; text-transform:uppercase; color:var(--text-muted,#666); font-weight:600;">Valuation</div>
        <div style="font-weight:700; color:var(--navy,#0A192F); font-size:13px;">${formatCurrency(asset.value)}</div>
      </div>
    `;
  }

  if (typeSelect) {
    if (asset.type === 'Stocks/MF' || asset.assetType === 'demat') {
      typeSelect.value = 'transmission';
    } else if (!asset.hasNomination) {
      typeSelect.value = 'noc';
    } else {
      typeSelect.value = 'claim';
    }
  }

  if (loading) loading.style.display = 'none';
  if (outputSection) outputSection.style.display = 'none';

  modal.style.display = 'flex';
};

window.closeAiLetterModal = function() {
  const modal = document.getElementById('aiLetterModal');
  if (modal) modal.style.display = 'none';
  currentAiLetterAssetId = null;
};

async function handleGenerateAiLetter() {
  if (!currentAiLetterAssetId) return;
  const asset = assetsData.find(a => a.id === currentAiLetterAssetId || String(a.id) === String(currentAiLetterAssetId));
  if (!asset) return;

  const loading = document.getElementById('aiLetterLoading');
  const outputSection = document.getElementById('aiLetterOutputSection');
  const contentText = document.getElementById('aiLetterContentText');
  const noteBox = document.getElementById('aiLetterStatutoryNote');
  const generateBtn = document.getElementById('btnGenerateLetter');

  const letterType = document.getElementById('letterTypeSelect')?.value || 'claim';
  const nomineeRelation = document.getElementById('letterNomineeRelation')?.value.trim() || 'Legal Heir / Nominee';

  if (loading) loading.style.display = 'block';
  if (outputSection) outputSection.style.display = 'none';
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span>⏳</span> Drafting...';
  }

  try {
    const res = await AnvayaApi.draftAssetLetter({
      assetId: asset.id,
      assetName: asset.name,
      category: asset.assetType || 'other',
      type: asset.type,
      institution: asset.institution,
      accountNumber: asset.accountNumber,
      approximateValue: asset.value,
      hasNomination: asset.hasNomination,
      letterType,
      nomineeRelation
    });

    if (res && res.letterContent) {
      if (contentText) contentText.value = res.letterContent;
      if (noteBox) {
        noteBox.innerHTML = `<strong>Statutory Guidance:</strong> ${res.statutoryNotes || 'Ensure original Death Certificate and self-attested KYC documents are carried along with this application.'}`;
      }
      if (outputSection) outputSection.style.display = 'flex';
      if (typeof showToast === 'function') {
        showToast(res.isAI ? 'Legal letter drafted successfully with Anvaya AI!' : 'Legal letter generated successfully!', 'success');
      }
    } else {
      throw new Error('Empty response');
    }
  } catch (err) {
    console.warn('Backend drafter failed, using client fallback:', err.message);
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const localContent = `Date: ${todayStr}\n\nTo,\nThe Branch Manager / Competent Officer,\n${asset.institution || 'Competent Authority'},\n[Branch Address / City]\n\nSubject: Formal Application for Settlement / Transmission of Deceased Asset — ${asset.name} (Ref: ${asset.accountNumber || 'N/A'})\n\nRespected Sir / Madam,\n\nI, [Nominee Name], residing at [Address], respectfully submit this formal application for the release, transfer, and settlement of proceeds for the above-referenced asset held in the name of my late family member, [Late Account Holder Name].\n\nAsset Particulars:\n- Asset Name: ${asset.name}\n- Account / Policy / Folio Number: ${asset.accountNumber || 'XXXX-XXXX'}\n- Approximate Valuation: ${formatCurrency(asset.value)}\n- Nomination Status: ${asset.hasNomination ? 'Nominee Registered in records' : 'Claim under Legal Heirship'}\n\nEnclosed Documents:\n1. Certified copy of Municipal Death Certificate\n2. Self-attested PAN & Aadhaar of Claimant / Nominee\n3. Original Passbook / Certificate / Statement\n4. Duly filled Deceased Claim Application (Form DA-2)\n\nKindly acknowledge receipt and settle the proceeds into my bank account at your earliest convenience under statutory guidelines.\n\nYours faithfully,\n\n___________________________\n[Claimant Name]\nRelationship: ${nomineeRelation}\nPhone: [Your Phone Number]\nAddress: [Your Address]`;

    if (contentText) contentText.value = localContent;
    if (noteBox) {
      noteBox.innerHTML = `<strong>Statutory Guidance:</strong> Under RBI Master Directions, banks must settle claims within 15 days upon submission of full documentation.`;
    }
    if (outputSection) outputSection.style.display = 'flex';
    if (typeof showToast === 'function') showToast('Letter generated using statutory legal template', 'info');
  } finally {
    if (loading) loading.style.display = 'none';
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<span>✨</span> Re-Generate Letter';
    }
  }
}

function handleCopyAiLetter() {
  const text = document.getElementById('aiLetterContentText')?.value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') showToast('Letter copied to clipboard! Paste into Word or Docs.', 'success');
  }).catch(() => {
    const textarea = document.getElementById('aiLetterContentText');
    if (textarea) {
      textarea.select();
      document.execCommand('copy');
      if (typeof showToast === 'function') showToast('Letter copied to clipboard!', 'success');
    }
  });
}

function handlePrintAiLetter() {
  const text = document.getElementById('aiLetterContentText')?.value;
  if (!text) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Legal Claim Letter - Anvaya</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; margin: 40px; color: #000; }
        pre { font-family: inherit; font-size: inherit; white-space: pre-wrap; word-break: break-word; }
        @media print {
          body { margin: 20mm; }
        }
      </style>
    </head>
    <body>
      <pre>${text}</pre>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
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
    let actionButtons = `<button class="btn btn-ghost btn-sm btn-view-details" data-asset-id="${asset.id}">View Details</button>`;

    actionButtons += ` <button class="btn btn-ghost btn-sm btn-draft-letter" data-asset-id="${asset.id}" title="Draft claim letter with AI" style="color:var(--blue,#2576A6); font-weight:600;">✨ Draft Letter</button>`;

    if (asset.assetType) {
      actionButtons += ` <button class="btn btn-ghost btn-sm btn-transfer-guide" data-asset-type="${asset.assetType}">Transfer Guide</button>`;
    }

    if (asset.assetType === 'locker' || asset.type === 'Others' && asset.name.toLowerCase().includes('locker')) {
      actionButtons += ' <button class="btn btn-ghost btn-sm btn-locker-alert">Locker Alert</button>';
    }

    actionButtons += ` <button class="btn btn-ghost btn-sm btn-quick-delete" data-asset-id="${asset.id}" title="Remove asset" style="color:var(--text-muted,#9ca3af); font-size:13px; padding:4px 8px; margin-left:auto;">🗑</button>`;

    card.innerHTML = `
      <button class="asset-menu-btn" data-asset-id="${asset.id}" title="Quick actions" aria-label="Asset options">⋮</button>
      <div class="asset-dropdown">
        <button class="dropdown-item" onclick="openAiLetterModal('${asset.id}')">
          <span style="color:var(--blue,#2576A6); font-weight:bold;">✨</span> Draft Claim Letter (AI)
        </button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" onclick="quickUpdateAssetStatus('${asset.id}', 'Transferred')">
          <span style="color:var(--green-dark,#276749); font-weight:bold;">✓</span> Mark Transferred
        </button>
        <button class="dropdown-item" onclick="quickUpdateAssetStatus('${asset.id}', 'In Progress')">
          <span style="color:var(--blue,#2576A6); font-weight:bold;">⏳</span> Mark In Progress
        </button>
        <button class="dropdown-item" onclick="quickUpdateAssetStatus('${asset.id}', 'Not Started')">
          <span style="color:var(--gold,#b7791f); font-weight:bold;">○</span> Mark Not Started
        </button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" onclick="openAssetDetails('${asset.id}')">
          <span>📋</span> Full Overview
        </button>
        <button class="dropdown-item delete" onclick="quickDeleteAsset('${asset.id}')">
          <span>🗑</span> Remove Asset
        </button>
      </div>

      <div class="asset-details">
        <div class="asset-header" style="padding-right: 36px;">
          <div class="asset-type-icon">${asset.icon}</div>
          <span class="badge ${getStatusBadgeClass(asset.status)}">${asset.status}</span>
        </div>
        <h4 class="asset-name">${asset.name}</h4>
        <div class="asset-inst">${asset.institution || 'N/A'}</div>
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
