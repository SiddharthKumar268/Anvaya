// ANVAYA - Shared Client Utilities
// Loaded on every page before page-specific scripts

const ANVAYA = {
  API_BASE: window.ANVAYA_API_BASE || (
    typeof window !== 'undefined' && (window.location.port === '5500' || window.location.port === '5501' || window.location.port === '3000')
      ? 'http://localhost:5000/api/v1'
      : '/api/v1'
  ),
  TOKEN_KEY: 'anvaya_token',
  CASE_KEY: 'anvaya_case_id',
  USER_KEY: 'anvaya_user',
};

// --- Auth Utilities ---
function getToken() {
  return localStorage.getItem(ANVAYA.TOKEN_KEY);
}

function getUser() {
  try {
    const userStr = localStorage.getItem(ANVAYA.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function getCaseId() {
  const id = localStorage.getItem(ANVAYA.CASE_KEY);
  return (id && id !== 'null' && id !== 'undefined') ? id : null;
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  localStorage.removeItem(ANVAYA.TOKEN_KEY);
  localStorage.removeItem(ANVAYA.CASE_KEY);
  localStorage.removeItem(ANVAYA.USER_KEY);
  window.location.href = 'login.html';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

// --- Favicon Guard ---
(function ensureFavicon() {
  if (typeof document !== 'undefined' && !document.querySelector("link[rel*='icon']")) {
    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = '../assets/favicon.ico';
    document.head.appendChild(link);
  }
})();

// --- API Helper ---
async function apiRequest(endpoint, options = {}) {
  const url = `${ANVAYA.API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// --- Format Utilities ---
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹ 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount).replace('₹', '₹ ');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

// --- Sidebar Renderer ---
function renderSidebar(activePage) {
  const sidebarEl = document.getElementById('sidebar');
  if (!sidebarEl) return;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: `<path d='M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'/><polyline points='9 22 9 12 15 12 15 22'/>`, href: 'dashboard.html' },
    { id: 'onboarding', label: 'Onboarding', icon: `<path d='M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2'/><circle cx='8.5' cy='7' r='4'/><line x1='20' y1='8' x2='20' y2='14'/><line x1='23' y1='11' x2='17' y2='11'/>`, href: 'Onboarding.html' },
    { id: 'documents', label: 'Document Checklist', icon: `<path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/><polyline points='14 2 14 8 20 8'/><path d='M9 15l2 2 4-4'/>`, href: 'documents.html' },
    { id: 'claims', label: 'Claim Tracker', icon: `<path d='M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2'/><rect x='8' y='2' width='8' height='4' rx='1'/><line x1='8' y1='12' x2='16' y2='12'/><line x1='8' y1='16' x2='12' y2='16'/>`, href: 'claims.html' },
    { id: 'calculator', label: 'Benefit Calculator', icon: `<rect x='4' y='2' width='16' height='20' rx='2'/><line x1='8' y1='6' x2='16' y2='6'/><line x1='8' y1='10' x2='16' y2='10'/><line x1='8' y1='14' x2='12' y2='14'/><line x1='8' y1='18' x2='10' y2='18'/>`, href: 'calculator.html' },
    { id: 'assets', label: 'Asset Transfer', icon: `<polyline points='17 1 21 5 17 9'/><line x1='3' y1='5' x2='21' y2='5'/><polyline points='7 23 3 19 7 15'/><line x1='21' y1='19' x2='3' y2='19'/>`, href: 'assets.html' },
    { id: 'discovery', label: 'Statement Discovery', icon: `<circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/><path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/><polyline points='14 2 14 8 20 8'/>`, href: 'discovery.html' },
    { id: 'nomination', label: 'No Nomination Path', icon: `<circle cx='12' cy='10' r='3'/><path d='M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z'/>`, href: 'nomination.html' },
    { id: 'pension', label: 'Pension & Benefits', icon: `<rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a4 4 0 00-8 0v2'/>`, href: 'pension.html' },
    { id: 'udgam', label: 'UDGAM Checker', icon: `<circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/><line x1='8' y1='11' x2='14' y2='11'/><line x1='11' y1='8' x2='11' y2='14'/>`, href: 'udgam.html' },
    { id: 'reports', label: 'Reports', icon: `<line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/>`, href: 'reports.html' },
    { id: 'chat', label: 'Ask Anvaya AI', icon: `<path d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z'/>`, href: 'chat.html' },
    { id: 'help', label: 'Help & Guides', icon: `<circle cx='12' cy='12' r='10'/><path d='M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3'/><line x1='12' y1='17' x2='12.01' y2='17'/>`, href: 'help.html' },
    { id: 'settings', label: 'Settings', icon: `<circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'/>`, href: 'settings.html' },
  ];

  let navHTML = '';
  navItems.forEach(item => {
    const isActive = item.id === activePage ? 'active' : '';
    navHTML += `
      <a href="${item.href}" class="nav-item ${isActive}">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            ${item.icon}
          </svg>
        </span>
        <span class="nav-label">${item.label}</span>
      </a>
    `;
  });

  sidebarEl.innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-icon">
        <img src="../assets/favicon-32x32.png" alt="ANVAYA" width="32" height="32" style="border-radius: 8px; object-fit: cover; display: block;" onerror="this.outerHTML='<svg viewBox=\'0 0 42 42\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'><rect width=\'42\' height=\'42\' rx=\'10\' fill=\'#2576A6\'/><path d=\'M21 10C21 10 14 16 14 22C14 26 17.5 29 21 29C24.5 29 28 26 28 22C28 16 21 10 21 10Z\' fill=\'white\'/></svg>'">
      </div>
      <div>
        <div class="brand-text">ANVAYA</div>
        <div class="brand-tagline">Financial Support. Every step, together.</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${navHTML}
    </nav>
    <div class="sidebar-support">
      <h4>We're here to help</h4>
      <p>Compassionate support whenever you need.</p>
      <a href="mailto:kumarsiddharth166@gmail.com" class="support-email" title="Email Support">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
        </svg>
        <span>kumarsiddharth166@gmail.com</span>
      </a>
      <button class="support-btn" onclick="window.location.href='help.html'">Contact Support</button>
      <div class="sidebar-hours">Mon - Sat | 9 AM - 7 PM</div>
    </div>
    <div class="sidebar-logout">
      <button class="logout-btn" onclick="logout()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span class="nav-label">Logout</span>
      </button>
    </div>
  `;
}

// --- Header Renderer ---
function renderHeader(options = {}) {
  const headerEl = document.getElementById('top-header');
  if (!headerEl) return;

  const user = getUser();
  const firstName = user && user.name ? user.name.split(' ')[0] : 'Siddharth';
  const defaultGreeting = `Namaste, ${firstName}!`;

  const greeting = options.greeting || defaultGreeting;
  const subtitle = options.subtitle || "We're with you in every step of this journey.";
  const caseId = options.caseId || getCaseId() || 'ANV-000';
  const notificationCount = options.notificationCount !== undefined ? options.notificationCount : 3;
  
  const avatarLetter = user && user.name ? user.name.charAt(0).toUpperCase() : (firstName ? firstName.charAt(0).toUpperCase() : 'S');

  headerEl.innerHTML = `
    <div class="island-left">
      <button class="back-btn" onclick="window.history.back()" aria-label="Go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="menu-toggle" onclick="toggleSidebar()" aria-label="Toggle Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="island-greeting">
        <div class="island-title">
          <span class="greeting-lead">${greeting}</span>
          <span class="island-auto-wrap">
            <span class="island-auto-text" id="island-auto-text"></span>
            <span class="island-cursor"></span>
          </span>
        </div>
        <span class="island-subtitle">${subtitle}</span>
      </div>
    </div>
    <div class="island-center">
      <div class="island-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search claims, documents, schemes...">
      </div>
    </div>
    <div class="island-cluster">
      <button class="notification-btn" aria-label="Notifications" onclick="window.location.href='settings.html'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        ${notificationCount > 0 ? `<span class="notification-badge">${notificationCount}</span>` : ''}
      </button>
      <div class="avatar-btn" onclick="window.location.href='settings.html'" title="My Profile">
        <div class="avatar">${avatarLetter}</div>
      </div>
    </div>
  `;

  // Start smooth inline typewriter text directly after greeting
  startIslandTypewriter();
}

function startIslandTypewriter() {
  const phrases = [
    "Hum aapke saath hain.",
    "Har kadam par aapka sahara.",
    "Fikr mat kijiye, hum sambhal lenge.",
    "Himmat rakhiye, sab theek hoga.",
    "Aapka parivaar, hamari zimmedari.",
    "Har mushkil ka aasaan samadhaan.",
    "9 claims surakshit track ho rahe hain.",
    "36 zaroori dastavez verified."
  ];

  if (window._islandTypewriterTimeout) {
    clearTimeout(window._islandTypewriterTimeout);
  }

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function typeTick() {
    const el = document.getElementById("island-auto-text");
    if (!el) return;

    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      el.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
    }

    let typeSpeed = isDeleting ? 20 : 50;

    if (!isDeleting && charIdx === currentPhrase.length) {
      typeSpeed = 2800; // Gentle pause when phrase is fully typed
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typeSpeed = 450; // Brief pause before typing next phrase
    }

    window._islandTypewriterTimeout = setTimeout(typeTick, typeSpeed);
  }

  typeTick();
}

// --- Mobile Sidebar Toggle ---
function toggleSidebar() {
  document.body.classList.toggle('sidebar-open');
  
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    overlay.onclick = () => document.body.classList.remove('sidebar-open');
    document.body.appendChild(overlay);
  }
}

// --- DOM Ready Helper ---
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// --- Toast Helper ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} fade-in`;
  
  let bgColor, borderColor, iconColor;
  switch(type) {
    case 'success': 
      bgColor = 'var(--green-soft)'; borderColor = 'var(--green)'; iconColor = 'var(--green-dark)'; break;
    case 'error': 
      bgColor = 'var(--red-soft)'; borderColor = 'var(--red)'; iconColor = 'var(--red-dark)'; break;
    case 'warning': 
      bgColor = 'var(--gold-soft)'; borderColor = 'var(--gold)'; iconColor = '#9A6E1B'; break;
    default: 
      bgColor = 'var(--surface)'; borderColor = 'var(--blue)'; iconColor = 'var(--blue)'; break;
  }

  toast.style.cssText = `
    background: ${bgColor};
    border-left: 4px solid ${borderColor};
    color: var(--text-primary);
    padding: 14px 20px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-card);
    font-size: 14px;
    font-weight: 500;
    min-width: 280px;
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  toast.innerHTML = `
    <span style="color: ${iconColor}; display: flex;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : 
          type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' : 
          '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
      </svg>
    </span>
    ${message}
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Page Initializer ---
function initPage(pageName, options = {}) {
  onReady(() => {
    renderSidebar(pageName);
    renderHeader(options);
    
    // Optionally trigger auth check
    if (options.requireAuth !== false) {
      // requireAuth();
    }
  });
}

// Export for global access
window.ANVAYA = ANVAYA;
window.getToken = getToken;
window.getUser = getUser;
window.getCaseId = getCaseId;
window.isLoggedIn = isLoggedIn;
window.logout = logout;
window.requireAuth = requireAuth;
window.apiRequest = apiRequest;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
window.daysUntil = daysUntil;
window.timeAgo = timeAgo;
window.renderSidebar = renderSidebar;
window.renderHeader = renderHeader;
window.toggleSidebar = toggleSidebar;
window.onReady = onReady;
window.showToast = showToast;
window.initPage = initPage;
