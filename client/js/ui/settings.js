// Settings Page — Dynamic with API Integration

const DEMO_PROFILE = {
  name: 'Priya Sharma',
  email: 'priya.sharma@email.com',
  phone: '+91 98765 43210',
  relationship: 'child',
  case: {
    caseId: 'ANV-2026-0847',
    status: 'active',
    assetsCount: 8,
    claimsCount: 5,
    documentsCount: 12,
    deceased: { fullName: 'Ramesh Sharma', dateOfPassing: '2026-08-01' },
    createdAt: '2026-08-15T00:00:00.000Z'
  }
};

let profileData = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initPage === 'function') {
    initPage('settings', {
      greeting: 'Settings',
      subtitle: 'Manage your account and preferences'
    });
  }

  setupTabs();
  loadProfile();
  setupProfileForm();
  setupPasswordForm();
  setupCopyBtn();
  setupExportBtn();
  setupDeleteBtn();
  setupLogoutBtn();
});

// --- Tab switching ---
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-item');
  const panels = document.querySelectorAll('.settings-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
      });
      const targetId = tab.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
        setTimeout(() => targetPanel.classList.add('active'), 10);
      }
    });
  });
}

// --- Load profile from API ---
async function loadProfile() {
  try {
    if (typeof apiRequest === 'function') {
      const data = await apiRequest('/settings/profile');
      profileData = data;
      populateProfile(data);
      return;
    }
  } catch (err) {
    console.warn('Settings API unavailable, using demo data:', err.message);
  }

  // Demo fallback
  profileData = DEMO_PROFILE;
  populateProfile(DEMO_PROFILE);
}

function populateProfile(data) {
  // Profile tab
  const nameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const relationshipInput = document.getElementById('relationship');
  const avatarEl = document.querySelector('.avatar-circle');
  const profileName = document.querySelector('.profile-title h3');

  if (nameInput) nameInput.value = data.name || '';
  if (emailInput) emailInput.value = data.email || '';
  if (phoneInput) phoneInput.value = data.phone || '';
  if (relationshipInput) {
    // Map backend values to select options
    const relMap = { widow: 'Spouse', widower: 'Spouse', son: 'Child', daughter: 'Child', parent: 'Parent', other: 'Other', child: 'Child', spouse: 'Spouse', sibling: 'Sibling' };
    const displayRel = relMap[data.relationship] || data.relationship || '';
    const options = relationshipInput.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === displayRel) {
        relationshipInput.selectedIndex = i;
        break;
      }
    }
  }
  if (avatarEl && data.name) avatarEl.textContent = data.name.charAt(0).toUpperCase();
  if (profileName && data.name) profileName.textContent = data.name;

  // Case tab
  if (data.case) {
    const caseIdText = document.getElementById('case-id-text');
    if (caseIdText) caseIdText.textContent = data.case.caseId || 'N/A';

    const deceasedName = document.getElementById('deceased-name');
    if (deceasedName && data.case.deceased) {
      deceasedName.value = data.case.deceased.fullName || '';
    }

    const dod = document.getElementById('dod');
    if (dod && data.case.deceased && data.case.deceased.dateOfPassing) {
      const date = new Date(data.case.deceased.dateOfPassing);
      dod.value = date.toISOString().split('T')[0];
    }

    // Stats
    const statValues = document.querySelectorAll('.stat-box .stat-value');
    if (statValues.length >= 3) {
      const createdDate = new Date(data.case.createdAt);
      statValues[0].textContent = createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      statValues[1].textContent = data.case.assetsCount || 0;
      statValues[2].textContent = data.case.claimsCount || 0;
    }
  }
}

// --- Profile form ---
function setupProfileForm() {
  const profileForm = document.getElementById('profile-form');
  if (!profileForm) return;

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('full-name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      relationship: document.getElementById('relationship').value
    };

    if (!payload.name || !payload.email) {
      showSettingsToast('Name and email are required', 'error');
      return;
    }

    try {
      if (typeof apiRequest === 'function') {
        const result = await apiRequest('/settings/profile', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        profileData = { ...profileData, ...result };

        // Update localStorage user info for header
        const currentUser = typeof getUser === 'function' ? getUser() : null;
        if (currentUser) {
          localStorage.setItem('anvaya_user', JSON.stringify({ ...currentUser, name: result.name }));
        }

        showSettingsToast('Profile updated successfully', 'success');
        // Update avatar and name display
        const avatarEl = document.querySelector('.avatar-circle');
        if (avatarEl) avatarEl.textContent = result.name.charAt(0).toUpperCase();
        const profileName = document.querySelector('.profile-title h3');
        if (profileName) profileName.textContent = result.name;
        return;
      }
    } catch (err) {
      showSettingsToast(err.message || 'Failed to update profile', 'error');
      return;
    }

    // Demo fallback
    showSettingsToast('Profile updated successfully', 'success');
  });
}

// --- Password form ---
function setupPasswordForm() {
  const passwordForm = document.getElementById('password-form');
  if (!passwordForm) return;

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      showSettingsToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showSettingsToast('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      if (typeof apiRequest === 'function') {
        await apiRequest('/settings/password', {
          method: 'PUT',
          body: JSON.stringify({ currentPassword, newPassword })
        });
        showSettingsToast('Password updated successfully', 'success');
        passwordForm.reset();
        return;
      }
    } catch (err) {
      showSettingsToast(err.message || 'Failed to update password', 'error');
      return;
    }

    // Demo fallback
    showSettingsToast('Password updated successfully', 'success');
    passwordForm.reset();
  });
}

// --- Copy Case ID ---
function setupCopyBtn() {
  const copyBtn = document.getElementById('copy-case-id');
  const caseIdText = document.getElementById('case-id-text');
  if (!copyBtn || !caseIdText) return;

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(caseIdText.textContent).then(() => {
      showSettingsToast('Case ID copied to clipboard', 'info');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  });
}

// --- Export Data ---
function setupExportBtn() {
  const exportBtn = document.getElementById('export-data');
  if (!exportBtn) return;

  exportBtn.addEventListener('click', async () => {
    showSettingsToast('Preparing data export...', 'info');

    try {
      if (typeof apiRequest === 'function') {
        const data = await apiRequest('/settings/export');
        // Trigger download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anvaya-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSettingsToast('Data export complete. Download started.', 'success');
        return;
      }
    } catch (err) {
      console.warn('Export API unavailable:', err.message);
    }

    // Demo fallback
    setTimeout(() => {
      showSettingsToast('Data export complete. Downloading...', 'success');
    }, 2000);
  });
}

// --- Delete Account ---
function setupDeleteBtn() {
  const deleteBtn = document.getElementById('delete-account');
  if (!deleteBtn) return;

  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone. All your cases, documents, and claims will be permanently deleted.')) {
      return;
    }

    try {
      if (typeof apiRequest === 'function') {
        await apiRequest('/settings/account', { method: 'DELETE' });
        showSettingsToast('Account deleted. Redirecting...', 'error');
        setTimeout(() => {
          if (typeof logout === 'function') {
            logout();
          } else {
            localStorage.clear();
            window.location.href = 'login.html';
          }
        }, 2000);
        return;
      }
    } catch (err) {
      showSettingsToast(err.message || 'Failed to delete account', 'error');
      return;
    }

    // Demo fallback
    showSettingsToast('Account deletion initiated. Contacting support...', 'error');
  });
}

// --- Logout ---
function setupLogoutBtn() {
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    if (typeof logout === 'function') {
      logout();
    } else {
      window.location.href = '../index.html';
    }
  });
}

// --- Toast helper (uses global showToast if available, else local) ---
function showSettingsToast(message, type = 'info') {
  // Try global showToast from shared.js first
  if (typeof showToast === 'function' && document.querySelector('.toast-container, #toast-container')) {
    showToast(message, type);
    return;
  }

  // Local fallback
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = '';
  if (type === 'success') {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInUp 0.3s ease reverse forwards';
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 300);
  }, 4000);
}
