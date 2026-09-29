// client/js/api/anvayaApi.js
// Centralized API service for Assets, Calculator, Pension, UDGAM, Guides, Safety
// Uses apiRequest() from shared.js (must be loaded first)

const AnvayaApi = {

  // ─── Assets ─────────────────────────────────────────────
  async getAssets(caseId) {
    const query = caseId ? `?caseId=${encodeURIComponent(caseId)}` : '';
    return apiRequest(`/assets${query}`);
  },

  async createAsset(payload) {
    return apiRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateAsset(assetId, payload) {
    return apiRequest(`/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteAsset(assetId) {
    return apiRequest(`/assets/${assetId}`, {
      method: 'DELETE'
    });
  },

  async draftAssetLetter(payload) {
    return apiRequest('/assets/draft-letter', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

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

  async calculatePensionEntitlements(payload) {
    return apiRequest('/calculators/pension/calculate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getInvestmentRecommendations(payload) {
    return apiRequest('/calculators/recommendations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // ─── UDGAM ──────────────────────────────────────────────
  async checkUdgam(bankName) {
    return apiRequest(`/calculators/udgam?bankName=${encodeURIComponent(bankName)}`);
  },

  async getUdgamBanks() {
    return apiRequest('/calculators/udgam/banks');
  },

  async searchUdgam(payload) {
    return apiRequest('/calculators/udgam/search', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async claimUdgamToAsset(payload) {
    return apiRequest('/calculators/udgam/claim-to-asset', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async generateUdgamClaimLetter(payload) {
    return apiRequest('/calculators/udgam/ai-letter', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async aiPredictLostAccounts(payload) {
    return apiRequest('/calculators/udgam/ai-detective', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
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

  // ─── Reports & Progress ─────────────────────────────────
  async getReportSummary(caseId) {
    const endpoint = caseId && caseId !== 'latest' && caseId !== 'demo' ? `/reports/summary/${caseId}` : '/reports/summary';
    return apiRequest(endpoint);
  },

  // ─── AI Document Intelligence ──────────────────────────
  async analyzeDocument(payload) {
    return apiRequest('/rag/analyze-document', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // ─── Discovery ──────────────────────────────────────────
  async analyzeStatement(file) {
    const formData = new FormData();
    formData.append('statement', file);
    const token = typeof getToken === 'function' ? getToken() : localStorage.getItem('anvaya_token');
    const baseUrl = (typeof ANVAYA !== 'undefined' && ANVAYA.API_BASE) || 'http://localhost:5000/api/v1';
    const response = await fetch(`${baseUrl}/discovery/analyze`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Analysis failed');
    }
    return response.json();
  },

  async confirmDiscoveryLead(payload) {
    return apiRequest('/discovery/confirm', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async confirmLead(payload) {
    return this.confirmDiscoveryLead(payload);
  }
};

