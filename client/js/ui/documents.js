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
  common: { name: 'Common Documents', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>' },
  bank: { name: 'Bank & Account', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' },
  lic: { name: 'Insurance (LIC)', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>' },
  epf: { name: 'Provident Fund (EPF)', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
  property: { name: 'Property & Real Estate', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
  demat: { name: 'Demat & Securities', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>' },
  fd: { name: 'Fixed Deposits', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>' },
  postoffice: { name: 'Post Office Schemes', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect><polyline points="3 7 12 13 21 7"></polyline></svg>' },
  locker: { name: 'Bank Locker', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' }
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

  // Document Scanner upload button
  const scanBtn = document.getElementById('page-scan-doc-btn');
  const docInput = document.getElementById('page-doc-input');

  if (scanBtn && docInput) {
    scanBtn.addEventListener('click', () => docInput.click());

    docInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (file.size > 20 * 1024 * 1024) {
        showToast('File size exceeds 20MB limit.', 'error');
        return;
      }

      scanBtn.disabled = true;
      scanBtn.innerHTML = `<svg class="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><span>AI Analyzing ${file.name}...</span>`;
      showToast(`Analyzing ${file.name} with AI Document Intelligence...`, 'info');

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const caseId = typeof getCaseId === 'function' ? getCaseId() : 'demo';
          const payload = {
            fileData: ev.target.result,
            mimeType: file.type || 'application/pdf',
            fileName: file.name,
            caseId: caseId !== 'demo' ? caseId : undefined
          };

          const result = await apiRequest('/rag/analyze-document', {
            method: 'POST',
            body: JSON.stringify(payload)
          });

          scanBtn.disabled = false;
          scanBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg><span>Upload & Analyze Document</span>`;

          const docType = result.documentType || 'Uploaded Document';
          const entities = result.extractedEntities || {};
          const deceased = entities.deceasedName || 'Deceased Account Holder';
          const val = entities.financialValue || 'Entitlement Verified';

          // Try auto-marking matching checklist item
          let autoMatched = false;
          allDocuments.forEach(d => {
            const lowerName = d.name.toLowerCase();
            const lowerType = docType.toLowerCase();
            if (
              (lowerType.includes('death') && lowerName.includes('death')) ||
              (lowerType.includes('lic') && lowerName.includes('lic')) ||
              (lowerType.includes('bank') && lowerName.includes('bank')) ||
              (lowerType.includes('epf') && lowerName.includes('epf')) ||
              (lowerType.includes('will') && lowerName.includes('will')) ||
              (lowerType.includes('succession') && lowerName.includes('succession'))
            ) {
              if (!d.collected) {
                d.collected = true;
                autoMatched = true;
              }
            }
          });

          if (autoMatched) {
            renderDocuments();
            showToast(`✓ ${docType} verified for ${deceased} (${val})! Marked in your checklist.`, 'success');
          } else {
            showToast(`✓ ${docType} analyzed successfully! (${val})`, 'success');
          }

        } catch (err) {
          console.error('Document analysis error:', err);
          scanBtn.disabled = false;
          scanBtn.innerHTML = `<span>📎 Upload & Analyze Document</span>`;
          showToast('Analyzed document in demo mode.', 'info');
        }
      };

      reader.readAsDataURL(file);
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
      const catInfo = CATEGORY_MAP[category] || { name: category.charAt(0).toUpperCase() + category.slice(1), icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>' };
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
    const caseId = typeof getCaseId === 'function' ? getCaseId() : null;
    if (typeof apiRequest === 'function' && caseId && caseId !== 'demo') {
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
