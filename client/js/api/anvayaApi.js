// client/js/api/anvayaApi.js
// Centralized API service for Assets, Calculator, Pension, UDGAM, Guides, Safety
// Uses apiRequest() from shared.js (must be loaded first)

const AnvayaApi = {

  // ─── Assets ─────────────────────────────────────────────
  async getTransferSteps(assetType) {
    return apiRequest(`/assets/transfer/${assetType}`);
  },

  async getNoNominationPath() {
    return apiRequest('/assets/no-nomination');
  },

  async getMinorProtection() {
    return apiRequest('/assets/minor-protection');
  },

  async checkLiability(loanType) {
    return apiRequest(`/assets/liability/${loanType}`);
  },

  async getLockerAlert(deathNoticeDate) {
    return apiRequest(`/assets/locker-alert?deathNoticeDate=${encodeURIComponent(deathNoticeDate)}`);
  },

  // ─── Calculator ─────────────────────────────────────────
  async calculateBenefits(payload) {
    return apiRequest('/calculators/benefits', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getPmjjbyGuide() {
    return apiRequest('/calculators/pmjjby');
  },

  async getFdBreaker(bankName) {
    const query = bankName ? `?bankName=${encodeURIComponent(bankName)}` : '';
    return apiRequest(`/calculators/fd-breaker${query}`);
  },

  // ─── Pension ────────────────────────────────────────────
  async getPensionBenefits(employerType) {
    return apiRequest(`/calculators/pension/${employerType}`);
  },

  // ─── UDGAM ──────────────────────────────────────────────
  async checkUdgam(bankName) {
    return apiRequest(`/calculators/udgam?bankName=${encodeURIComponent(bankName)}`);
  },

  // ─── Guides ─────────────────────────────────────────────
  async getKnowledgeHub(category) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest(`/guides/knowledge-hub${query}`);
  },

  async getPostOfficeGuide(scheme) {
    return apiRequest(`/guides/post-office/${scheme}`);
  },

  async getSuccessionGuide(tab) {
    const query = tab ? `?tab=${encodeURIComponent(tab)}` : '';
    return apiRequest(`/guides/succession${query}`);
  },

  // ─── Safety ─────────────────────────────────────────────
  async getFraudAlerts() {
    return apiRequest('/safety/fraud-alerts');
  },

  async getProtectionScore(payload) {
    return apiRequest('/safety/protection-score', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async checkPresumedDeath(yearsMissing) {
    return apiRequest(`/safety/presumed-death?yearsMissing=${yearsMissing}`);
  }
};
