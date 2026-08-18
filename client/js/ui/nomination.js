// nomination.js — Connected to Backend API
// Uses AnvayaApi from api/anvayaApi.js + showToast from shared.js

// Demo fallback for no-nomination path
const DEMO_NO_NOMINATION = {
  legalHeirCertificate: { issuedBy: 'Tehsildar/SDM', timeline: '1-2 months', usedFor: 'Bank accounts, small claims' },
  successionCertificate: { issuedBy: 'Civil Court', timeline: '6 months - 2 years', usedFor: 'Property, large claims, disputed cases' },
  steps: [
    'Determine if a Legal Heir Certificate is enough (usually sufficient for banks)',
    'If property or high-value/disputed assets are involved, file for Succession Certificate in civil court',
    'Use the certificate as proof of heirship for all asset-specific claims'
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize page
  if (typeof initPage === 'function') {
    initPage('nomination', {
      greeting: 'Legal Succession Guide',
      subtitle: 'When nomination is missing, we show you the way'
    });
  }

  // ─── Help Choose Button — replace confirm() with in-page modal ──
  const helpChooseBtn = document.getElementById('help-choose-btn');
  if (helpChooseBtn) {
    helpChooseBtn.addEventListener('click', async () => {
      // Fetch data from backend
      let noNomData = DEMO_NO_NOMINATION;
      try {
        noNomData = await AnvayaApi.getNoNominationPath();
      } catch (err) {
        console.warn('Backend unavailable, using demo data:', err.message);
      }

      // Show an in-page decision modal instead of confirm()
      showDecisionModal(noNomData);
    });
  }
});

// ─── Decision Modal (replaces browser confirm()) ────────────
function showDecisionModal(data) {
  // Remove existing modal if any
  const existing = document.getElementById('decision-modal-overlay');
  if (existing) existing.remove();

  const lhc = data.legalHeirCertificate || {};
  const sc = data.successionCertificate || {};

  const overlay = document.createElement('div');
  overlay.id = 'decision-modal-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(11,40,84,0.6);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:var(--glass-bg,#f8f9f1);border-radius:var(--radius-lg,16px);padding:2rem;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:var(--shadow-elevated,0 8px 32px rgba(0,0,0,0.2));';

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <h3 style="margin:0;color:var(--navy,#0B2854);">Which path is right for you?</h3>
      <button id="close-decision-modal" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted,#666);line-height:1;">&times;</button>
    </div>

    <p style="margin-bottom:1.25rem;color:var(--text-secondary,#555);">Are all assets <strong>movable</strong> (bank accounts, insurance, EPF) and total value <strong>less than ₹1 Lakh</strong>?</p>

    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;">
      <button id="btn-choose-yes" class="btn btn-primary" style="flex:1;">Yes — Simple path</button>
      <button id="btn-choose-no" class="btn btn-secondary" style="flex:1;">No — Full path</button>
    </div>

    <div style="background:rgba(0,0,0,0.04);border-radius:var(--radius-md,12px);padding:1rem;">
      <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
        <thead>
          <tr style="border-bottom:1px solid rgba(0,0,0,0.1);">
            <th style="text-align:left;padding:6px 8px;">Feature</th>
            <th style="text-align:left;padding:6px 8px;">Legal Heir Cert.</th>
            <th style="text-align:left;padding:6px 8px;">Succession Cert.</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:6px 8px;">Issued By</td><td style="padding:6px 8px;">${lhc.issuedBy || 'Tehsildar/SDM'}</td><td style="padding:6px 8px;">${sc.issuedBy || 'Civil Court'}</td></tr>
          <tr><td style="padding:6px 8px;">Timeline</td><td style="padding:6px 8px;">${lhc.timeline || '1-2 months'}</td><td style="padding:6px 8px;">${sc.timeline || '6 months - 2 years'}</td></tr>
          <tr><td style="padding:6px 8px;">Used For</td><td style="padding:6px 8px;">${lhc.usedFor || 'Small claims'}</td><td style="padding:6px 8px;">${sc.usedFor || 'Property, large claims'}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Button handlers
  modal.querySelector('#btn-choose-yes').addEventListener('click', () => {
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('highlighted'));
    document.getElementById('path-legal-heir').classList.add('highlighted');
    overlay.remove();
    if (typeof showToast === 'function') {
      showToast('Legal Heir Certificate recommended — simpler and faster', 'success');
    }
  });

  modal.querySelector('#btn-choose-no').addEventListener('click', () => {
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('highlighted'));
    document.getElementById('path-succession').classList.add('highlighted');
    overlay.remove();
    if (typeof showToast === 'function') {
      showToast('Succession Certificate recommended — covers all asset types', 'info');
    }
  });

  // Close handlers
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  modal.querySelector('#close-decision-modal').addEventListener('click', () => overlay.remove());
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

// ─── Step Wizard Logic ──────────────────────────────────────
function toggleStep(stepNumber) {
  const steps = [1, 2, 3, 4];
  
  steps.forEach(step => {
    const card = document.getElementById(`step-${step}`);
    if (!card) return;
    const content = card.querySelector('.step-content');
    const icon = card.querySelector('.toggle-icon');
    
    if (step === stepNumber) {
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'block';
      icon.textContent = isVisible ? '▶' : '▼';
      if (!isVisible) card.classList.add('active');
      else card.classList.remove('active');
    } else {
      content.style.display = 'none';
      icon.textContent = '▶';
      card.classList.remove('active');
    }
  });
}

function completeStep(stepNumber) {
  const currentCard = document.getElementById(`step-${stepNumber}`);
  if (currentCard) {
    currentCard.classList.add('completed');
  }
  
  const nextStep = stepNumber + 1;
  if (nextStep <= 4) {
    toggleStep(nextStep);
    
    // Smooth scroll to next step
    setTimeout(() => {
      const nextCard = document.getElementById(`step-${nextStep}`);
      if (nextCard) {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  } else {
    // Replace alert() with showToast()
    if (typeof showToast === 'function') {
      showToast('Process marked as complete! 🎉', 'success');
    }
  }
}

// ─── Checklist Toggle Logic ─────────────────────────────────
function toggleChecklist() {
  const content = document.getElementById('documents-checklist');
  const icon = document.getElementById('checklist-icon');
  
  if (content.style.display !== 'none') {
    content.style.display = 'none';
    icon.textContent = '▶';
  } else {
    content.style.display = 'block';
    icon.textContent = '▼';
  }
}

// Expose to window for inline onclick handlers in HTML
window.toggleStep = toggleStep;
window.completeStep = completeStep;
window.toggleChecklist = toggleChecklist;
