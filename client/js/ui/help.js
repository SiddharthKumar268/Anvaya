// help.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize page
  if (typeof initPage === 'function') {
    initPage('help', {
      greeting: 'Help & Guides',
      subtitle: 'Everything you need to know, in one place'
    });
  }

  // Data
  const categories = [
    { icon: 'rocket', title: 'Getting Started', desc: 'How to begin your recovery journey', searchable: 'getting started begin recovery journey' },
    { icon: 'document', title: 'Documents Guide', desc: 'Which documents you need and where to get them', searchable: 'documents guide need where to get certificate' },
    { icon: 'clipboard', title: 'Claims Guide', desc: 'Step-by-step claim filing process', searchable: 'claims guide step file filing process' },
    { icon: 'scales', title: 'Legal Process', desc: 'Succession, nomination, court procedures', searchable: 'legal process succession nomination court procedures lawyer' },
    { icon: 'bank', title: 'Government Schemes', desc: 'PMJJBY, PMSBY, UDGAM, EPF and more', searchable: 'government schemes pmjjby pmsby udgam epf provident fund' },
    { icon: 'shield', title: 'Safety & Fraud Protection', desc: 'Avoid middlemen and scams', searchable: 'safety fraud protection avoid middlemen scams' }
  ];

  const guides = [
    { title: 'How to obtain a Death Certificate', readTime: '5 min read', badge: 'Documents', badgeClass: 'badge-blue' },
    { title: 'How to file a bank claim as a nominee', readTime: '7 min read', badge: 'Banking', badgeClass: 'badge-navy' },
    { title: 'Understanding Legal Heir Certificate vs Succession Certificate', readTime: '10 min read', badge: 'Legal', badgeClass: 'badge-navy' },
    { title: 'EPF withdrawal process for nominees', readTime: '6 min read', badge: 'Gov', badgeClass: 'badge-green' },
    { title: 'How to claim LIC policy after death', readTime: '8 min read', badge: 'Insurance', badgeClass: 'badge-blue' },
    { title: 'Preventing bank locker seizure', readTime: '4 min read', badge: 'Banking', badgeClass: 'badge-navy' }
  ];

  const helplines = [
    { name: 'EPFO Helpline', number: '1800-118-005' },
    { name: 'LIC Helpline', number: '1800-258-4477' },
    { name: 'IRDA (Insurance)', number: '155255' },
    { name: 'Consumer Forum', number: '1800-114-000' },
    { name: 'Anvaya Support', number: 'support@anvaya.in' }
  ];

  const faqs = [
    { 
      q: 'What is the first thing I should do after losing a family member?', 
      a: 'Focus on obtaining the death certificate as early as possible. Most institutions will require at least 5-10 copies to begin any claims process.' 
    },
    { 
      q: 'How long do I have to file insurance claims?', 
      a: 'Most insurance companies prefer claims to be filed within 30-90 days, but delays are accepted if valid reasons are provided. It\'s best to notify them early even if all documents aren\'t ready.' 
    },
    { 
      q: 'What if the deceased had no will?', 
      a: 'If there is no will (intestate), the assets are distributed according to the applicable succession laws (e.g., Hindu Succession Act). A succession certificate or legal heir certificate will be required.' 
    },
    { 
      q: 'How do I find out all the bank accounts?', 
      a: 'You can use the RBI\'s UDGAM portal to search across multiple banks for unclaimed deposits. Also check their emails, SMS, passbooks, and tax returns (26AS).' 
    },
    { 
      q: 'Can I access the bank locker immediately?', 
      a: 'If you are a registered nominee or joint holder with "survivor" clause, you can access it relatively fast. Otherwise, it requires a succession certificate and bank inventory process.' 
    },
    { 
      q: 'What is the process for EPF withdrawal?', 
      a: 'Nominees can file Form 20 (for PF) and Form 10D (for pension) through the EPFO portal. The process usually takes 20-30 days after document submission.' 
    },
    { 
      q: 'Do I need a lawyer for succession certificate?', 
      a: 'Yes, a succession certificate requires filing a petition in the civil court. Having a lawyer will help navigate the legal formalities and court hearings.' 
    },
    { 
      q: 'How long does the entire process usually take?', 
      a: 'Simple nominated bank accounts can take 15-30 days. Complex cases involving courts (succession certificate) can take 6-12 months.' 
    }
  ];

  // DOM Elements
  const categoriesGrid = document.getElementById('categories-grid');
  const guidesList = document.getElementById('guides-list');
  const helplinesList = document.getElementById('helplines-list');
  const faqAccordion = document.getElementById('faq-accordion');
  const searchInput = document.getElementById('help-search');

  // Render Functions
  function renderCategories(data) {
    categoriesGrid.innerHTML = data.map(cat => `
      <div class="category-card" data-search="${cat.searchable}">
        <div class="category-icon">${cat.icon}</div>
        <h3 class="category-title">${cat.title}</h3>
        <p class="category-desc">${cat.desc}</p>
        <a href="#" class="category-link" onclick="event.preventDefault(); showToast('Category opening...')">Read More →</a>
      </div>
    `).join('');
  }

  function renderGuides() {
    guidesList.innerHTML = guides.map(guide => `
      <div class="guide-item" onclick="showToast('Guide article opening...')">
        <div class="guide-info">
          <span class="guide-title">${guide.title}</span>
          <div class="guide-meta">
            <span>Time: ${guide.readTime}</span>
            <span class="badge ${guide.badgeClass}">${guide.badge}</span>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted)"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    `).join('');
  }

  function renderHelplines() {
    helplinesList.innerHTML = helplines.map(line => `
      <div class="helpline-item">
        <div>
          <div class="helpline-name">${line.name}</div>
          <div class="helpline-number">${line.number}</div>
        </div>
        <button class="copy-btn" onclick="copyText('${line.number}')" aria-label="Copy ${line.name}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
    `).join('');
  }

  function renderFAQs(data) {
    faqAccordion.innerHTML = data.map((faq, index) => `
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false" onclick="toggleFAQ(this)">
          ${faq.q}
          <svg class="faq-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="faq-answer">
          <p>${faq.a}</p>
        </div>
      </div>
    `).join('');
  }

  // Initialization
  renderCategories(categories);
  renderGuides();
  renderHelplines();
  renderFAQs(faqs);

  // FAQ Toggle Logic
  window.toggleFAQ = function(btn) {
    const item = btn.parentElement;
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    
    // Close all others
    document.querySelectorAll('.faq-item').forEach(faq => {
      faq.classList.remove('active');
      faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!isExpanded) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }
  };

  // Copy to clipboard
  window.copyText = function(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${text} to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy');
    });
  };

  // Toast Notification
  window.showToast = function(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Search Logic with Debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.toLowerCase();
    
    searchTimeout = setTimeout(() => {
      // Filter Categories
      const filteredCategories = categories.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.desc.toLowerCase().includes(query) || 
        c.searchable.includes(query)
      );
      renderCategories(filteredCategories);

      // Filter FAQs
      const filteredFaqs = faqs.filter(f => 
        f.q.toLowerCase().includes(query) || 
        f.a.toLowerCase().includes(query)
      );
      renderFAQs(filteredFaqs);
      
    }, 300);
  });
});
