//    caseApi.js
const API_BASE = window.ANVAYA_API_BASE || "http://localhost:5000/api/v1";

const CaseApi = {
  // Create a new case from onboarding
  async createCase(payload) {
    return await apiRequest('/cases', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Get case details
  async getCase(caseId) {
    return await apiRequest(`/cases/${caseId}`);
  },

  // Get dashboard summary stats
  async getDashboard(caseId) {
    return await apiRequest(`/cases/${caseId}/dashboard`);
  },

  // Generate document checklist for a case
  async generateDocuments(caseId) {
    return await apiRequest(`/cases/${caseId}/documents/generate`, {
      method: 'POST'
    });
  },

  // Toggle document collected status
  async toggleDocument(docId) {
    return await apiRequest(`/cases/documents/${docId}/toggle`, {
      method: 'PUT'
    });
  },

  // Generate claims for a case
  async generateClaims(caseId) {
    return await apiRequest(`/cases/${caseId}/claims/generate`, {
      method: 'POST'
    });
  },

  // Get all claims for a case
  async getClaims(caseId) {
    return await apiRequest(`/cases/${caseId}/claims`);
  },

  // Update claim status
  async updateClaimStatus(claimId, status) {
    return await apiRequest(`/cases/claims/${claimId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Generate comprehensive AI Case Summary
  async generateAISummary(caseId) {
    return await apiRequest(`/cases/${caseId}/ai-summary`, {
      method: 'POST'
    });
  }
};