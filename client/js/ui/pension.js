// pension.js — Connected to Backend API
// Uses AnvayaApi from api/anvayaApi.js + showToast from shared.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize page
  initPage('pension', {
    greeting: 'Pension & Benefits',
    subtitle: 'Track pension and employer-related benefits'
  });

  const form = document.getElementById('eligibility-form');
  const checkBtn = document.getElementById('check-eligibility-btn');
  const benefitsBreakdown = document.getElementById('benefits-breakdown');

  // ─── Add employer type selector if not present ────────────
  addEmployerTypeField();

  // ─── Form submission — call backend API ───────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    checkBtn.textContent = 'Checking...';
    checkBtn.disabled = true;

    const employerTypeEl = document.getElementById('employer-type');
    const employerType = employerTypeEl ? employerTypeEl.value : 'private';

    try {
      // Fetch employer-type specific benefits from backend
      const data = await AnvayaApi.getPensionBenefits(employerType);
      
      // Dynamically render the benefits breakdown
      renderBenefitsFromAPI(data.benefits || [], employerType);
      
      // Show benefits breakdown
      benefitsBreakdown.classList.remove('hidden');
      benefitsBreakdown.scrollIntoView({ behavior: 'smooth' });

      if (typeof showToast === 'function') {
        showToast(`Benefits loaded for ${employerType} employer`, 'success');
      }
    } catch (err) {
      console.warn('Backend unavailable, showing default benefits:', err.message);
      
      // Fallback — just show the static HTML breakdown
      benefitsBreakdown.classList.remove('hidden');
      benefitsBreakdown.scrollIntoView({ behavior: 'smooth' });
    } finally {
      checkBtn.textContent = 'Check Eligibility';
      checkBtn.disabled = false;
    }
  });
});

// ─── Add employer type dropdown to the eligibility form ─────
function addEmployerTypeField() {
  const form = document.getElementById('eligibility-form');
  if (!form || document.getElementById('employer-type')) return;

  // Find the "relationship" form group and insert after it
  const firstGroup = form.querySelector('.form-group');
  if (!firstGroup) return;

  const newGroup = document.createElement('div');
  newGroup.className = 'form-group';
  newGroup.innerHTML = `
    <label class="form-label" for="employer-type">Employer Type</label>
    <select id="employer-type" class="form-input">
      <option value="private" selected>Private Sector</option>
      <option value="government">Government</option>
      <option value="psu">PSU (Public Sector Unit)</option>
    </select>
  `;

  firstGroup.parentNode.insertBefore(newGroup, firstGroup);
}

// ─── Render benefits from API response ──────────────────────
function renderBenefitsFromAPI(benefits, employerType) {
  const section = document.getElementById('benefits-breakdown');
  if (!section) return;

  // Find the grid inside benefits-breakdown, or create one
  let grid = section.querySelector('.grid-3');
  
  if (!grid) return;

  // Benefit icons mapping
  const iconMap = {
    'Family Pension Continuation': '📋',
    'Gratuity (5+ yrs service)': '🎁',
    'Group Term Life Insurance': '🛡️',
    'Unpaid Salary': '💰',
    'Leave Encashment': '📅',
    'CGHS/Medical Benefits': '🏥',
    'ESOP/RSU (if applicable)': '📈',
    'Provident Fund Settlement': '🏦',
  };

  // Clear existing benefit cards and rebuild from API data
  grid.innerHTML = benefits.map(benefit => {
    const icon = iconMap[benefit] || '💼';
    return `
      <div class="glass-card benefit-card">
        <div class="benefit-icon">${icon}</div>
        <h4>${benefit}</h4>
        <p class="text-secondary">Applicable for ${employerType} sector</p>
      </div>
    `;
  }).join('');

  // Update summary text
  const summarySection = section.querySelector('.benefits-summary');
  if (summarySection) {
    const countEl = summarySection.querySelector('.total-amount.text-gold');
    if (countEl) {
      countEl.textContent = `${benefits.length} Benefits`;
    }
  }
}

// ─── Step details data ──────────────────────────────────────
const stepsData = {
  1: {
    title: 'Step 1: Gather Documents',
    desc: 'Collect death certificate, Aadhar, PAN, bank passbook, and proof of relationship.',
    duration: '1-3 days'
  },
  2: {
    title: 'Step 2: Submit Form 10D to EPFO',
    desc: 'Submit Form 10D along with death certificate, joint photograph, and cancelled cheque to claim EPS family pension.',
    duration: '7-10 days'
  },
  3: {
    title: 'Step 3: Employer Verification',
    desc: 'The employer needs to verify the claim details and approve it through their employer portal.',
    duration: '5-15 days'
  },
  4: {
    title: 'Step 4: EPFO Processing',
    desc: 'EPFO field office processes the claim after employer verification.',
    duration: '15-30 days'
  },
  5: {
    title: 'Step 5: First Pension Credit',
    desc: 'Pension payment order (PPO) is issued and first pension amount is credited to the bank account.',
    duration: 'First week of following month'
  }
};

function showStepDetails(stepNum) {
  const detailsDiv = document.getElementById('step-details');
  const data = stepsData[stepNum];
  
  if (data) {
    detailsDiv.innerHTML = `
      <h4>${data.title}</h4>
      <p class="text-secondary mt-1">${data.desc}</p>
      <p class="text-sm mt-1 text-gold" style="font-size: 0.875rem;">Expected duration: ${data.duration}</p>
    `;
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') {
      showToast('Copied to clipboard: ' + text, 'success');
    }
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });
}

// Expose to window for inline onclick handlers in HTML
window.showStepDetails = showStepDetails;
window.copyToClipboard = copyToClipboard;
