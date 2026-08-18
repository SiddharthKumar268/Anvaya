const DEMO_CLAIMS = {
  claims: [
    { _id: 'c1', claimType: 'lic', status: 'pending', deadline: '2024-05-27', filedOn: null, meta: { title: 'LIC Policy Claim', ref: 'Policy No. 1234567890', institution: 'LIC of India', amount: 500000 } },
    { _id: 'c2', claimType: 'epf', status: 'pending', deadline: '2024-06-03', filedOn: null, meta: { title: 'EPFO / PF Claim', ref: 'UAN: 101234567890', institution: 'EPFO', amount: 320000 } },
    { _id: 'c3', claimType: 'bank', status: 'pending', deadline: '2024-06-06', filedOn: null, meta: { title: 'Bank Account Settlement', ref: 'A/c No. XXXX4567', institution: 'State Bank of India', amount: 245000 } },
    { _id: 'c4', claimType: 'property', status: 'in-progress', deadline: null, filedOn: '2024-05-10', meta: { title: 'Property Mutation', ref: 'Survey No. 123/A', institution: 'Sub-Registrar Office', amount: null } },
    { _id: 'c5', claimType: 'postoffice', status: 'in-progress', deadline: null, filedOn: '2024-05-08', meta: { title: 'Post Office PPF', ref: 'PPF A/c No. 7654321', institution: 'India Post', amount: 180000 } },
    { _id: 'c6', claimType: 'bank', status: 'in-progress', deadline: null, filedOn: '2024-05-12', meta: { title: 'HDFC Bank FD Closure', ref: 'FD A/c No. 5010023456781', institution: 'HDFC Bank', amount: 150000 } },
    { _id: 'c7', claimType: 'pmjjby', status: 'done', deadline: null, filedOn: '2024-04-15', meta: { title: 'PMJJBY Claim', ref: 'A/c No. XXXXX1234', institution: 'SBI Life', amount: 200000, completedOn: '2024-05-02' } },
    { _id: 'c8', claimType: 'bank', status: 'done', deadline: null, filedOn: '2024-04-10', meta: { title: 'Sukanya Samriddhi A/c', ref: 'A/c No. 1234 5678 9012', institution: 'Post Office', amount: 95000, completedOn: '2024-04-28' } },
    { _id: 'c9', claimType: 'bank', status: 'done', deadline: null, filedOn: '2024-04-05', meta: { title: 'Demat Account Transfer', ref: 'DP ID: IN300XXX', institution: 'Zerodha', amount: null, completedOn: '2024-04-18' } },
  ]
};

const CLAIM_TYPES = {
  lic: { label: 'Insurance', icon: '🛡️', fullName: 'LIC of India' },
  epf: { label: 'Provident Fund', icon: '💼', fullName: 'EPFO' },
  bank: { label: 'Banking', icon: '🏦', fullName: 'Bank' },
  property: { label: 'Property', icon: '🏠', fullName: 'Property' },
  postoffice: { label: 'Post Office', icon: '📮', fullName: 'India Post' },
  pmjjby: { label: 'PMJJBY', icon: '❤️', fullName: 'PMJJBY Insurance' },
  pmsby: { label: 'PMSBY', icon: '🏥', fullName: 'PMSBY Cover' }
};

let allClaims = [];
let currentView = 'board'; // 'board' or 'list'
let activeTypeFilter = 'all';
let sortBy = 'deadline';

onReady(() => {
  if (typeof initPage === 'function') initPage('claims');
  loadClaims();
  setupEventListeners();
});

function mapServerClaim(claim) {
    const titles = {
        bank: 'Bank Account Settlement',
        lic: 'LIC Policy Claim',
        epf: 'EPFO / PF Claim',
        property: 'Property Mutation',
        postoffice: 'Post Office Scheme',
        pmjjby: 'PMJJBY Claim',
        pmsby: 'PMSBY Claim'
    };
    const title = titles[claim.claimType] || claim.claimType.toUpperCase() + ' Claim';
    return {
        _id: claim._id,
        claimType: claim.claimType,
        status: claim.status,
        deadline: claim.deadline,
        filedOn: claim.filedOn,
        meta: {
            title: title,
            ref: claim.claimType.toUpperCase() + ' Claim',
            institution: CLAIM_TYPES[claim.claimType]?.fullName || 'Institution',
            amount: null,
            completedOn: claim.filedOn
        }
    };
}

async function loadClaims() {
  try {
    let caseId = typeof getCaseId === 'function' ? getCaseId() : 'demo';
    let data;
    
    if (typeof apiRequest === 'function' && caseId !== 'demo') {
        try {
            const res = await apiRequest(`/cases/${caseId}/claims`, { method: 'GET' });
            if (res && Array.isArray(res)) {
                data = res.map(mapServerClaim);
            } else {
                throw new Error("Invalid response");
            }
        } catch (e) {
            console.warn('Failed to load from API, using demo data', e);
            if (typeof showToast === 'function') showToast('Running in demo mode — connect your server for live data', 'info');
            data = DEMO_CLAIMS.claims;
        }
    } else {
        if (typeof showToast === 'function' && caseId === 'demo') showToast('Running in demo mode — connect your server for live data', 'info');
        data = DEMO_CLAIMS.claims;
    }
    
    allClaims = data.map(claim => {
        let priority = getPriority(claim);
        let daysUntilDeadline = claim.deadline ? (typeof daysUntil === 'function' ? daysUntil(claim.deadline) : calculateDays(claim.deadline)) : Infinity;
        return { ...claim, priority, daysUntilDeadline };
    });
    
    renderClaims();
  } catch (err) {
    console.error('Failed to load claims', err);
    allClaims = DEMO_CLAIMS.claims.map(claim => ({
        ...claim,
        priority: getPriority(claim),
        daysUntilDeadline: claim.deadline ? (typeof daysUntil === 'function' ? daysUntil(claim.deadline) : calculateDays(claim.deadline)) : Infinity
    }));
    renderClaims();
  }
}

function calculateDays(dateStr) {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getPriority(claim) {
  if (claim.status === 'done') return null;
  if (!claim.deadline) return 'medium';
  const days = typeof daysUntil === 'function' ? daysUntil(claim.deadline) : calculateDays(claim.deadline);
  if (days <= 5) return 'high';
  if (days <= 15) return 'medium';
  return 'low';
}

function renderClaims() {
    let filtered = allClaims.filter(c => {
        if (activeTypeFilter === 'all') return true;
        if (activeTypeFilter === 'insurance' && (c.claimType === 'lic' || c.claimType === 'pmjjby' || c.claimType === 'pmsby')) return true;
        return c.claimType === activeTypeFilter;
    });

    filtered.sort((a, b) => {
        if (sortBy === 'deadline') {
            return a.daysUntilDeadline - b.daysUntilDeadline;
        } else if (sortBy === 'priority') {
            const pMap = { 'high': 1, 'medium': 2, 'low': 3, null: 4 };
            return (pMap[a.priority] || 4) - (pMap[b.priority] || 4);
        } else if (sortBy === 'type') {
            return a.claimType.localeCompare(b.claimType);
        }
        return 0;
    });

    const pending = filtered.filter(c => c.status === 'pending');
    const inProgress = filtered.filter(c => c.status === 'in-progress');
    const done = filtered.filter(c => c.status === 'done');

    // Update Header Stats
    const statsContainer = document.getElementById('header-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="mini-stat pending">🟡 ${pending.length} Pending</div>
            <div class="mini-stat progress">🔵 ${inProgress.length} In Progress</div>
            <div class="mini-stat done">🟢 ${done.length} Completed</div>
        `;
    }

    if (currentView === 'board') {
        renderBoardView(pending, inProgress, done);
    } else {
        renderListView(filtered);
    }
}

function renderBoardView(pending, inProgress, done) {
    const colPending = document.querySelector('#col-pending .column-content');
    const colInProgress = document.querySelector('#col-in-progress .column-content');
    const colDone = document.querySelector('#col-done .column-content');

    const bPending = document.querySelector('#col-pending .count-badge');
    const bInProgress = document.querySelector('#col-in-progress .count-badge');
    const bDone = document.querySelector('#col-done .count-badge');

    if (bPending) bPending.textContent = pending.length;
    if (bInProgress) bInProgress.textContent = inProgress.length;
    if (bDone) bDone.textContent = done.length;

    if (colPending) colPending.innerHTML = pending.map(c => renderClaimCard(c)).join('');
    if (colInProgress) colInProgress.innerHTML = inProgress.map(c => renderClaimCard(c)).join('');
    if (colDone) colDone.innerHTML = done.map(c => renderClaimCard(c)).join('');
}

function formatAmt(amt) {
    if (amt == null) return '';
    return typeof formatCurrency === 'function' ? formatCurrency(amt) : `₹${amt.toLocaleString('en-IN')}`;
}

function formatDt(dt) {
    if (!dt) return '';
    return typeof formatDate === 'function' ? formatDate(dt) : new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderClaimCard(claim) {
    const typeInfo = CLAIM_TYPES[claim.claimType] || { label: 'Other', icon: '📄', fullName: 'Unknown' };
    
    let badgeHtml = '';
    let bottomLeftHtml = '';
    
    if (claim.status === 'pending') {
        const days = claim.daysUntilDeadline !== Infinity ? claim.daysUntilDeadline : 0;
        badgeHtml = `<span class="badge badge-pending">Due in ${days} days</span>`;
        bottomLeftHtml = `<div class="claim-date ${days <= 5 ? 'urgent' : ''}">Deadline: ${formatDt(claim.deadline) || 'N/A'}</div>`;
    } else if (claim.status === 'in-progress') {
        badgeHtml = `<span class="badge badge-progress">In progress</span>`;
        bottomLeftHtml = `<div class="claim-date">Applied on: ${formatDt(claim.filedOn)}</div>`;
    } else {
        badgeHtml = `<span class="badge badge-completed">Completed</span>`;
        bottomLeftHtml = `<div class="claim-date">Completed on: ${formatDt(claim.meta?.completedOn || claim.filedOn)}</div>`;
    }

    let priorityDot = '';
    if (claim.priority) {
        const color = claim.priority === 'high' ? 'var(--red)' : (claim.priority === 'medium' ? 'var(--gold)' : 'var(--blue)');
        priorityDot = `<div class="claim-priority"><span class="priority-dot" style="background-color: ${color}; width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span> <span style="text-transform: capitalize;">${claim.priority}</span></div>`;
    }

    return `
        <div class="claim-card" data-id="${claim._id}">
            <div class="card-menu">⋮</div>
            <div class="card-dropdown">
                <button class="dropdown-item" onclick="updateClaimStatus('${claim._id}', 'pending')">Mark as Pending</button>
                <button class="dropdown-item" onclick="updateClaimStatus('${claim._id}', 'in-progress')">Mark as In Progress</button>
                <button class="dropdown-item" onclick="updateClaimStatus('${claim._id}', 'done')">Mark as Done</button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item">View Details</button>
            </div>
            
            <div class="claim-top">
                <div class="claim-top-left">
                    <div class="claim-type-icon ${claim.claimType}">${typeInfo.icon}</div>
                    <div class="claim-info">
                        <h4 class="claim-title">${claim.meta?.title || 'Claim'}</h4>
                        <div class="claim-ref">${claim.meta?.ref || ''}</div>
                    </div>
                </div>
            </div>
            <div class="claim-badges">${badgeHtml}</div>
            <div class="claim-institution">${claim.meta?.institution || typeInfo.fullName}</div>
            ${claim.meta?.amount ? `<div class="claim-amount">${formatAmt(claim.meta.amount)}</div>` : ''}
            
            <div class="claim-bottom">
                ${bottomLeftHtml}
                ${priorityDot}
            </div>
        </div>
    `;
}

function renderListView(claims) {
    const tbody = document.getElementById('list-table-body');
    if (!tbody) return;

    tbody.innerHTML = claims.map(claim => {
        const typeInfo = CLAIM_TYPES[claim.claimType] || { label: 'Other', icon: '📄', fullName: 'Unknown' };
        
        let statusBadge = '';
        if (claim.status === 'pending') statusBadge = '<span class="badge badge-pending">Pending</span>';
        if (claim.status === 'in-progress') statusBadge = '<span class="badge badge-progress">In Progress</span>';
        if (claim.status === 'done') statusBadge = '<span class="badge badge-completed">Completed</span>';

        let dateStr = '';
        if (claim.status === 'pending') dateStr = formatDt(claim.deadline);
        if (claim.status === 'in-progress') dateStr = formatDt(claim.filedOn);
        if (claim.status === 'done') dateStr = formatDt(claim.meta?.completedOn || claim.filedOn);

        let priorityStr = claim.priority ? claim.priority.charAt(0).toUpperCase() + claim.priority.slice(1) : '-';

        return `
            <tr>
                <td>
                    <div class="type-cell">
                        <div class="claim-type-icon ${claim.claimType}" style="width: 32px; height: 32px; font-size: 14px;">${typeInfo.icon}</div>
                        <span>${typeInfo.label}</span>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--navy);">${claim.meta?.title || 'Claim'}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${claim.meta?.ref || ''}</div>
                </td>
                <td>${claim.meta?.institution || typeInfo.fullName}</td>
                <td class="status-cell">${statusBadge}</td>
                <td>${dateStr || '-'}</td>
                <td>${priorityStr}</td>
                <td>
                    <div style="position: relative; display: inline-block;">
                        <button class="action-btn card-menu-btn" data-id="${claim._id}">⋮</button>
                        <div class="card-dropdown" style="right: 0; left: auto; top: 100%;">
                            <button class="dropdown-item" onclick="updateClaimStatus('${claim._id}', 'pending')">Mark as Pending</button>
                            <button class="dropdown-item" onclick="updateClaimStatus('${claim._id}', 'in-progress')">Mark as In Progress</button>
                            <button class="dropdown-item" onclick="updateClaimStatus('${claim._id}', 'done')">Mark as Done</button>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item">View Details</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function updateClaimStatus(claimId, newStatus) {
    try {
        if (typeof apiRequest === 'function') {
            const body = { status: newStatus };
            if (newStatus === 'done') body.filedOn = new Date().toISOString();
            
            const res = await apiRequest(`/cases/claims/${claimId}`, {
                method: 'PUT',
                body: JSON.stringify(body)
            });
        }
        
        // Optimistic update
        const claim = allClaims.find(c => c._id === claimId);
        if (claim) {
            claim.status = newStatus;
            if (newStatus === 'done' && !claim.filedOn) {
                claim.filedOn = new Date().toISOString();
                if (!claim.meta) claim.meta = {};
                claim.meta.completedOn = claim.filedOn;
            }
            claim.priority = getPriority(claim);
        }
        
        renderClaims();
        if (typeof showToast === 'function') showToast('Success', 'Claim status updated successfully', 'success');
        
    } catch (err) {
        console.error('Error updating status', err);
        if (typeof showToast === 'function') showToast('Error', 'Failed to update status', 'error');
    }
}

async function generateClaims() {
    try {
        let caseId = typeof getCaseId === 'function' ? getCaseId() : 'demo';
        if (typeof apiRequest === 'function' && caseId !== 'demo') {
            const res = await apiRequest(`/cases/${caseId}/claims/generate`, { method: 'POST' });
            if (res && Array.isArray(res)) {
                if (typeof showToast === 'function') showToast('Success', 'Claims auto-generated', 'success');
                loadClaims();
            }
        } else {
            if (typeof showToast === 'function') showToast('Success', 'Demo claims generated', 'success');
        }
    } catch (err) {
        console.error('Error generating claims', err);
        if (typeof showToast === 'function') showToast('Error', 'Failed to generate claims', 'error');
    }
}

function setupEventListeners() {
    // View Toggle
    const viewBtns = document.querySelectorAll('.view-toggle .toggle-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            viewBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            
            document.getElementById('board-view').style.display = currentView === 'board' ? 'grid' : 'none';
            document.getElementById('list-view').style.display = currentView === 'list' ? 'block' : 'none';
            
            renderClaims();
        });
    });

    // Filters
    const filterBtns = document.querySelectorAll('.claim-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activeTypeFilter = e.target.dataset.filter;
            renderClaims();
        });
    });

    // Sort
    const sortDropdown = document.getElementById('sort-dropdown');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            sortBy = e.target.value;
            renderClaims();
        });
    }

    // Generate Claims btn
    const genBtn = document.getElementById('btn-generate-claims');
    if (genBtn) {
        genBtn.addEventListener('click', generateClaims);
    }

    // Card menu delegation
    document.querySelector('.main-content').addEventListener('click', (e) => {
        const menuBtn = e.target.closest('.card-menu') || e.target.closest('.card-menu-btn');
        
        // Close all dropdowns first
        document.querySelectorAll('.card-dropdown').forEach(dd => {
            if (menuBtn && dd === menuBtn.nextElementSibling) return;
            dd.classList.remove('open');
        });

        if (menuBtn) {
            e.stopPropagation();
            const dropdown = menuBtn.nextElementSibling;
            if (dropdown && dropdown.classList.contains('card-dropdown')) {
                dropdown.classList.toggle('open');
            }
        }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.card-dropdown.open').forEach(dd => {
            dd.classList.remove('open');
        });
    });
}
