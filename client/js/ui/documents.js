const DEMO_DOCUMENTS = [
  { _id: 'd1', name: 'Death Certificate', requiredFor: 'common', collected: true },
  { _id: 'd2', name: 'Nominee ID Proof (Aadhaar/PAN)', requiredFor: 'common', collected: true },
  { _id: 'd3', name: 'PAN Card of Deceased', requiredFor: 'common', collected: false },
  { _id: 'd4', name: 'Succession / Legal Heir Certificate', requiredFor: 'common', collected: false },
  { _id: 'd5', name: 'Bank Passbook / Statement', requiredFor: 'bank', collected: true },
  { _id: 'd6', name: 'Account Holder\'s Death Certificate (Bank Attested)', requiredFor: 'bank', collected: false },
  { _id: 'd7', name: 'Nominee Declaration Form', requiredFor: 'bank', collected: true },
  { _id: 'd8', name: 'FD Receipts / Certificates', requiredFor: 'fd', collected: false },
  { _id: 'd9', name: 'LIC Policy Document', requiredFor: 'lic', collected: true },
  { _id: 'd10', name: 'LIC Claim Form (Form 3783)', requiredFor: 'lic', collected: false },
  { _id: 'd11', name: 'NSDL/CDSL Transmission Form', requiredFor: 'demat', collected: false },
  { _id: 'd12', name: 'Demat Account Statement', requiredFor: 'demat', collected: true },
  { _id: 'd13', name: 'EPF Composite Claim Form', requiredFor: 'epf', collected: false },
  { _id: 'd14', name: 'Employer Certificate', requiredFor: 'epf', collected: false },
  { _id: 'd15', name: 'Property Registration Documents', requiredFor: 'property', collected: true },
  { _id: 'd16', name: 'Mutation Application Form', requiredFor: 'property', collected: false },
  { _id: 'd17', name: 'Post Office Passbook', requiredFor: 'postoffice', collected: false },
  { _id: 'd18', name: 'PPF/NSC/KVP Certificate', requiredFor: 'postoffice', collected: true },
];

const CATEGORY_MAP = {
  common: { name: 'Common Documents', icon: '📋' },
  bank: { name: 'Bank & Account', icon: '🏦' },
  lic: { name: 'Insurance (LIC)', icon: '🛡️' },
  epf: { name: 'Provident Fund (EPF)', icon: '💼' },
  property: { name: 'Property & Real Estate', icon: '🏠' },
  demat: { name: 'Demat & Securities', icon: '📈' },
  fd: { name: 'Fixed Deposits', icon: '🏧' },
  postoffice: { name: 'Post Office Schemes', icon: '📮' },
  locker: { name: 'Bank Locker', icon: '🔐' }
};

let allDocuments = [];
let activeFilter = 'all';
let activeStatus = 'all';
let searchQuery = '';
let collapsedGroups = new Set();

onReady(() => {
  if (typeof initPage === 'function') {
    initPage('documents');
  }
  setupEventListeners();
  loadDocuments();
});

function setupEventListeners() {
  // Category filters
  document.querySelectorAll('#category-filters .filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#category-filters .filter-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.filter;
      renderDocuments();
    });
  });

  // Status filters
  document.querySelectorAll('#status-filters .filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#status-filters .filter-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeStatus = e.target.dataset.status;
      renderDocuments();
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('search-input');
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderDocuments();
      }, 300);
    });
  }
}

function inferCategory(docName) {
  if (!docName) return 'common';
  const lower = docName.toLowerCase();
  if (lower.includes('bank') || lower.includes('passbook') || lower.includes('account closure')) return 'bank';
  if (lower.includes('lic') || lower.includes('policy bond')) return 'lic';
  if (lower.includes('epf') || lower.includes('uan')) return 'epf';
  if (lower.includes('property') || lower.includes('legal heir') || lower.includes('mutation')) return 'property';
  if (lower.includes('demat') || lower.includes('transmission')) return 'demat';
  if (lower.includes('fd') || lower.includes('fixed deposit')) return 'fd';
  if (lower.includes('post office')) return 'postoffice';
  if (lower.includes('locker')) return 'locker';
  return 'common';
}

async function loadDocuments() {
  try {
    const caseId = typeof getCaseId === 'function' ? getCaseId() : 'demo';
    
    if (typeof apiRequest === 'function' && caseId !== 'demo') {
      try {
        const res = await apiRequest(`/cases/${caseId}/documents/generate`, {
          method: 'POST'
        });
        if (res && Array.isArray(res)) {
          allDocuments = res.map(doc => ({
            ...doc,
            requiredFor: doc.requiredFor || inferCategory(doc.name)
          }));
        } else {
          throw new Error('No documents in response');
        }
      } catch(e) {
        console.warn("Failed to load from API, using demo data", e);
        if (typeof showToast === 'function') {
          showToast('Running in demo mode — connect your server for live data', 'info');
        }
        allDocuments = [...DEMO_DOCUMENTS];
      }
    } else {
      if (typeof showToast === 'function' && caseId === 'demo') {
        showToast('Running in demo mode — connect your server for live data', 'info');
      }
      allDocuments = [...DEMO_DOCUMENTS];
    }
  } catch(e) {
    console.error("Error loading documents", e);
    allDocuments = [...DEMO_DOCUMENTS];
  }

  renderDocuments();
}

function renderDocuments() {
  const container = document.getElementById('documents-container');
  if (!container) return;

  // Filter documents
  const filteredDocs = allDocuments.filter(doc => {
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery)) {
      return false;
    }
    
    if (activeStatus === 'collected' && !doc.collected) return false;
    if (activeStatus === 'pending' && doc.collected) return false;
    
    if (activeFilter !== 'all') {
      if (activeFilter === 'other') {
        const knownFilters = ['common', 'bank', 'lic', 'property'];
        if (knownFilters.includes(doc.requiredFor)) return false;
      } else {
        if (doc.requiredFor !== activeFilter) return false;
      }
    }
    
    return true;
  });

  // Group by category
  const groups = {};
  filteredDocs.forEach(doc => {
    if (!groups[doc.requiredFor]) {
      groups[doc.requiredFor] = [];
    }
    groups[doc.requiredFor].push(doc);
  });

  let html = '';
  
  if (filteredDocs.length === 0) {
    html = `<div style="text-align:center; padding:40px; color:var(--text-muted, #6B7280)">
      <p>No documents found matching your filters.</p>
    </div>`;
  } else {
    // Sort groups based on CATEGORY_MAP order roughly
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      if (a === 'common') return -1;
      if (b === 'common') return 1;
      return a.localeCompare(b);
    });

    sortedCategories.forEach(category => {
      const docsInGroup = groups[category];
      const catInfo = CATEGORY_MAP[category] || { name: category.charAt(0).toUpperCase() + category.slice(1), icon: '📄' };
      const isCollapsed = collapsedGroups.has(category);
      const collapsedClass = isCollapsed ? 'collapsed' : '';
      
      html += `
        <div class="doc-group ${collapsedClass}" data-category="${category}">
          <div class="doc-group-header" onclick="toggleGroup('${category}')">
            <span class="group-icon">${catInfo.icon}</span>
            <span class="group-name">${catInfo.name}</span>
            <span class="group-count">${docsInGroup.length}</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div class="doc-group-body">
            ${docsInGroup.map((doc, index) => renderDocCard(doc, index)).join('')}
          </div>
        </div>
      `;
    });
  }
  
  container.innerHTML = html;
  updateSummaryStats();
}

function renderDocCard(doc, index) {
  const isCollected = doc.collected;
  const checkedClass = isCollected ? 'checked' : '';
  const collectedClass = isCollected ? 'collected' : '';
  const badgeClass = isCollected ? 'badge badge-green' : 'badge badge-gold';
  const badgeText = isCollected ? 'Collected' : 'Pending';
  const catInfo = CATEGORY_MAP[doc.requiredFor] || { name: 'Other' };
  
  return `
    <div class="doc-card ${collectedClass}" style="animation-delay: ${index * 0.05}s" onclick="toggleDocument('${doc._id}')">
      <div class="doc-check ${checkedClass}" onclick="event.stopPropagation(); toggleDocument('${doc._id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="doc-info">
        <div class="doc-name">${doc.name}</div>
        <div class="doc-category">${catInfo.name}</div>
      </div>
      <div class="doc-status">
        <span class="${badgeClass}">${badgeText}</span>
      </div>
    </div>
  `;
}

function toggleGroup(category) {
  if (collapsedGroups.has(category)) {
    collapsedGroups.delete(category);
  } else {
    collapsedGroups.add(category);
  }
  const groupEl = document.querySelector(`.doc-group[data-category="${category}"]`);
  if (groupEl) {
    groupEl.classList.toggle('collapsed');
  }
}

async function toggleDocument(docId) {
  const docIndex = allDocuments.findIndex(d => d._id === docId);
  if (docIndex === -1) return;
  
  const doc = allDocuments[docIndex];
  const newStatus = !doc.collected;
  
  // Optimistic update
  allDocuments[docIndex].collected = newStatus;
  renderDocuments();
  
  try {
    if (typeof apiRequest === 'function') {
      await apiRequest(`/cases/documents/${docId}/toggle`, {
        method: 'PUT'
      });
    }
    
    if (typeof showToast === 'function') {
      showToast(`Document marked as ${newStatus ? 'collected' : 'pending'}`, newStatus ? 'success' : 'info');
    }
  } catch (err) {
    console.error("Error toggling document", err);
    // Revert
    allDocuments[docIndex].collected = !newStatus;
    renderDocuments();
    
    if (typeof showToast === 'function') {
      showToast('Failed to update document status', 'error');
    } else {
      alert('Failed to update document status');
    }
  }
}

async function generateChecklist() {
  try {
    const caseId = typeof getCaseId === 'function' ? getCaseId() : 'demo';
    
    if (typeof apiRequest === 'function' && caseId !== 'demo') {
      const res = await apiRequest(`/cases/${caseId}/documents/generate`, {
        method: 'POST'
      });
      if (res && Array.isArray(res)) {
        if (typeof showToast === 'function') {
          showToast('Checklist generated successfully', 'success');
        }
        await loadDocuments();
      }
    } else {
      // Simulate
      if (typeof showToast === 'function') {
        showToast('Checklist generation simulated', 'success');
      }
      setTimeout(loadDocuments, 500);
    }
  } catch(e) {
    console.error("Error generating checklist", e);
    if (typeof showToast === 'function') {
      showToast('Failed to generate checklist', 'error');
    }
  }
}

function updateSummaryStats() {
  const total = allDocuments.length;
  const collected = allDocuments.filter(d => d.collected).length;
  const pending = total - collected;
  const progressPercent = total === 0 ? 0 : Math.round((collected / total) * 100);

  // Header
  const totalHeader = document.getElementById('total-count-header');
  const collectedHeader = document.getElementById('collected-count-header');
  const progressFill = document.getElementById('progress-fill');
  
  if (totalHeader) totalHeader.textContent = total;
  if (collectedHeader) collectedHeader.textContent = collected;
  if (progressFill) progressFill.style.width = `${progressPercent}%`;

  // Footer
  const totalFooter = document.getElementById('total-docs-footer');
  const collectedFooter = document.getElementById('collected-docs-footer');
  const pendingFooter = document.getElementById('pending-docs-footer');
  
  if (totalFooter) totalFooter.textContent = total;
  if (collectedFooter) collectedFooter.textContent = collected;
  if (pendingFooter) pendingFooter.textContent = pending;
}
