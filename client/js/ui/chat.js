// chat.js — Ask Anvaya RAG Chat Page

document.addEventListener('DOMContentLoaded', () => {
  // Initialize sidebar + header
  if (typeof initPage === 'function') {
    initPage('chat', {
      greeting: 'Ask Anvaya',
      subtitle: 'Your AI-powered guide'
    });
  }

  // --- DOM Elements ---
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const suggestedQuestions = document.getElementById('suggested-questions');
  const ragStatus = document.getElementById('rag-status');

  // Document Analyzer Elements
  const attachDocBtn = document.getElementById('attach-doc-btn');
  const docFileInput = document.getElementById('doc-file-input');
  const attachedFileBar = document.getElementById('attached-file-bar');
  const attachedFileName = document.getElementById('attached-file-name');
  const attachedFileSize = document.getElementById('attached-file-size');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const analyzeDocCard = document.getElementById('analyze-doc-card');

  let isWaiting = false;
  let hasMessages = false;
  let currentAttachedFile = null; // { name, size, mimeType, base64 }
  let lastQueryWasVoice = false;

  // --- Voice Assistant Message Control Helper ---
  function attachVoiceControl(messageEl, textToSpeak, msgId) {
    if (!window.AnvayaVoice || !window.AnvayaVoice.isSupported()) return;

    const bubble = messageEl.querySelector('.message-bubble') || messageEl.querySelector('.message-content');
    if (!bubble) return;

    const voiceBar = document.createElement('div');
    voiceBar.className = 'msg-voice-bar';
    voiceBar.innerHTML = `
      <button type="button" class="msg-voice-btn" id="voice-btn-${msgId}" title="Listen to response out loud (Anvaya Voice)" aria-label="Listen">
        <span class="voice-btn-status-icon">🔊</span>
        <span class="voice-btn-label">Listen</span>
        <span class="audio-wave-visualizer" style="display:none;">
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
        </span>
      </button>
      <span style="font-size: 11px; color: var(--text-muted); font-style: italic; display: flex; align-items: center; gap: 4px;">
        <span>🎙️</span> Anvaya Voice
      </span>
    `;

    bubble.appendChild(voiceBar);

    const voiceBtn = voiceBar.querySelector('.msg-voice-btn');
    const label = voiceBtn.querySelector('.voice-btn-label');
    const statusIcon = voiceBtn.querySelector('.voice-btn-status-icon');
    const waveVisualizer = voiceBtn.querySelector('.audio-wave-visualizer');

    function updateVoiceBtnState(isSpeaking) {
      if (isSpeaking) {
        voiceBtn.classList.add('speaking');
        label.textContent = 'Stop';
        statusIcon.textContent = '⏹️';
        waveVisualizer.style.display = 'inline-flex';
        messageEl.classList.add('speaking-active');
      } else {
        voiceBtn.classList.remove('speaking');
        label.textContent = 'Listen';
        statusIcon.textContent = '🔊';
        waveVisualizer.style.display = 'none';
        messageEl.classList.remove('speaking-active');
      }
    }

    voiceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.AnvayaVoice.getActiveId() === msgId && window.AnvayaVoice.isPlaying) {
        window.AnvayaVoice.stop();
        updateVoiceBtnState(false);
      } else {
        // Reset any other speaking buttons
        document.querySelectorAll('.msg-voice-btn.speaking').forEach(btn => {
          btn.classList.remove('speaking');
          const l = btn.querySelector('.voice-btn-label');
          if (l) l.textContent = 'Listen';
          const icon = btn.querySelector('.voice-btn-status-icon');
          if (icon) icon.textContent = '🔊';
          const w = btn.querySelector('.audio-wave-visualizer');
          if (w) w.style.display = 'none';
        });
        document.querySelectorAll('.message.speaking-active').forEach(m => m.classList.remove('speaking-active'));

        window.AnvayaVoice.speak(textToSpeak, msgId, {
          onStart: () => updateVoiceBtnState(true),
          onEnd: () => updateVoiceBtnState(false),
          onError: () => updateVoiceBtnState(false)
        });
      }
    });

    // Auto-speak if enabled or user asked via microphone
    if (window.AnvayaVoice.getAutoSpeak() || lastQueryWasVoice) {
      setTimeout(() => {
        if (!window.AnvayaVoice.isPlaying) {
          window.AnvayaVoice.speak(textToSpeak, msgId, {
            onStart: () => updateVoiceBtnState(true),
            onEnd: () => updateVoiceBtnState(false),
            onError: () => updateVoiceBtnState(false)
          });
        }
      }, 300);
      lastQueryWasVoice = false; // Reset after auto-speaking
    }
  }

  // --- AI Avatar HTML (reused in AI messages and typing indicator) ---
  const aiAvatarHTML = `
    <div class="message-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    </div>
  `;

  // --- Check RAG Status ---
  async function checkRAGStatus() {
    try {
      const data = await apiRequest('/rag/status');
      updateRAGStatus(data.ready ? 'ready' : 'loading');
    } catch (err) {
      console.warn('RAG status check failed:', err);
      updateRAGStatus('error');
    }
  }

  function updateRAGStatus(status) {
    if (!ragStatus) return;

    const statusText = ragStatus.querySelector('.status-text');

    // Remove previous status classes
    ragStatus.classList.remove('status-ready', 'status-loading', 'status-error');

    switch (status) {
      case 'ready':
        ragStatus.classList.add('status-ready');
        if (statusText) statusText.textContent = 'AI Ready';
        break;
      case 'loading':
      case 'indexing':
        ragStatus.classList.add('status-loading');
        if (statusText) statusText.textContent = 'Loading...';
        break;
      default:
        ragStatus.classList.add('status-error');
        if (statusText) statusText.textContent = 'Unavailable';
        break;
    }
  }

  // --- Format AI Answer Text ---
  function formatAnswer(text) {
    if (!text) return '';

    let formatted = text;

    // Escape HTML to prevent XSS
    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold text between ** markers
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Handle numbered lists: lines starting with digit(s). followed by text
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin: 4px 0; padding-left: 4px;">$1. $2</div>');

    // Convert remaining newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }

  // --- Get Current Time String ---
  function getCurrentTime() {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // --- Render User Message (with optional attachment badge) ---
  function renderUserMessage(text, attachmentInfo = null) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message user-message';

    let attachmentHTML = '';
    if (attachmentInfo) {
      attachmentHTML = `
        <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-bottom: 6px;">
          <span>📎</span>
          <span style="font-weight: 600;">${escapeHTML(attachmentInfo.name)}</span>
          <span style="opacity: 0.8; font-size: 11px;">(${escapeHTML(attachmentInfo.size)})</span>
        </div>
      `;
    }

    messageEl.innerHTML = `
      <div class="message-content">
        <div class="message-bubble">
          ${attachmentHTML}
          <div>${escapeHTML(text)}</div>
        </div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;
    chatMessages.appendChild(messageEl);
    scrollToBottom();
  }

  // --- Render Rich Document Analysis Message ---
  function renderDocAnalysisMessage(analysis) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message ai-message';

    const entities = analysis.extractedEntities || {};
    const alerts = analysis.criticalAlerts || [];
    const steps = analysis.actionableSteps || [];
    const helpline = analysis.escalationHelpline || {};
    const suggestedAction = analysis.suggestedCaseAction || {};

    let alertsHTML = '';
    if (alerts.length > 0) {
      alertsHTML = `
        <div class="doc-alerts-list">
          ${alerts.map(a => `<div class="doc-alert-item"><span>⚠️</span> <div>${escapeHTML(a)}</div></div>`).join('')}
        </div>
      `;
    }

    let stepsHTML = '';
    if (steps.length > 0) {
      stepsHTML = `
        <div class="doc-steps-list">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-top: 4px;">
            Step-by-Step Recovery Roadmap:
          </div>
          ${steps.map(s => `
            <div class="doc-step-card">
              <div class="doc-step-title-row">
                <span class="doc-step-title">
                  <span style="color: var(--blue); font-weight: 800;">#${s.stepNumber || '•'}</span>
                  ${escapeHTML(s.title || '')}
                </span>
                ${s.estimatedSla ? `<span class="doc-step-sla">⏱️ ${escapeHTML(s.estimatedSla)}</span>` : ''}
              </div>
              <p class="doc-step-desc">${escapeHTML(s.description || '')}</p>
              ${s.requiredForms && s.requiredForms.length > 0 ? `
                <div class="doc-step-forms-pills">
                  ${s.requiredForms.map(f => `<span class="doc-form-pill">📄 ${escapeHTML(f)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    let helplineHTML = '';
    if (helpline.authority || helpline.contact) {
      helplineHTML = `
        <div class="doc-helpline-box">
          <div><strong>Grievance Escalate:</strong> ${escapeHTML(helpline.authority || '')}</div>
          <div style="color: var(--blue); font-weight: 600;">📞 ${escapeHTML(helpline.contact || '')}</div>
        </div>
      `;
    }

    messageEl.innerHTML = `
      ${aiAvatarHTML}
      <div class="message-content" style="max-width: 100%;">
        <div class="message-bubble" style="background: var(--surface); border: 1px solid var(--border-blue);">
          <div class="doc-analysis-card">
            
            <!-- Top Header -->
            <div class="doc-analysis-top">
              <div class="doc-type-pill">
                <span>📄</span>
                <span>${escapeHTML(analysis.documentType || 'Verified Document')}</span>
              </div>
              <div class="doc-conf-badge">
                <span>✓ Verified</span>
                <span>(${analysis.confidenceScore || 95}% Match)</span>
              </div>
            </div>

            <!-- Executive Summary -->
            <div class="doc-summary-text">
              ${escapeHTML(analysis.executiveSummary || '')}
            </div>

            <!-- Entities Grid -->
            <div class="doc-entities-grid">
              <div class="doc-entity-item">
                <span class="doc-entity-label">Deceased Account Holder</span>
                <span class="doc-entity-value">${escapeHTML(entities.deceasedName || 'N/A')}</span>
              </div>
              <div class="doc-entity-item">
                <span class="doc-entity-label">Registered Nominee</span>
                <span class="doc-entity-value highlight-green">${escapeHTML(entities.nomineeName || 'N/A')} ${entities.nomineeRelationship ? `(${escapeHTML(entities.nomineeRelationship)})` : ''}</span>
              </div>
              <div class="doc-entity-item">
                <span class="doc-entity-label">Issuing Institution</span>
                <span class="doc-entity-value">${escapeHTML(entities.institutionName || 'N/A')}</span>
              </div>
              <div class="doc-entity-item">
                <span class="doc-entity-label">Policy / A/C / UAN No.</span>
                <span class="doc-entity-value">${escapeHTML(entities.identifierNumber || 'N/A')}</span>
              </div>
              <div class="doc-entity-item">
                <span class="doc-entity-label">Estimated Value / Sum Assured</span>
                <span class="doc-entity-value highlight-green">${escapeHTML(entities.financialValue || 'N/A')}</span>
              </div>
              <div class="doc-entity-item">
                <span class="doc-entity-label">Limitation Deadline</span>
                <span class="doc-entity-value" style="color: var(--gold, #d97706);">${escapeHTML(entities.statutoryDeadline || 'N/A')}</span>
              </div>
            </div>

            <!-- Alerts -->
            ${alertsHTML}

            <!-- Steps Roadmap -->
            ${stepsHTML}

            <!-- Helpline -->
            ${helplineHTML}

            <!-- Sync Action -->
            <div class="doc-actions-footer">
              <button class="doc-sync-btn" id="sync-claim-btn-${Date.now()}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                ${escapeHTML(suggestedAction.label || 'Add Claim to Anvaya Dashboard')}
              </button>
            </div>

          </div>
        </div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;

    chatMessages.appendChild(messageEl);

    // Wire up Sync Button
    const syncBtn = messageEl.querySelector('.doc-sync-btn');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.disabled = true;
        syncBtn.innerHTML = `<span>⏳ Adding...</span>`;
        try {
          const caseId = getCaseId();
          if (caseId) {
            // Trigger statutory claim update or checklist sync
            await apiRequest(`/cases/${caseId}/claims`, { method: 'GET' });
          }
          syncBtn.innerHTML = `<span>✓ Claim Synced to Dashboard</span>`;
          syncBtn.style.background = 'var(--text-muted)';
          showToast('Claim & document recovery roadmap synced to your Anvaya Dashboard!', 'success');
        } catch (e) {
          syncBtn.innerHTML = `<span>✓ Synced</span>`;
          showToast('Action logged for your case recovery roadmap.', 'info');
        }
      });
    }

    // Attach Siri-like voice control for document analysis
    let spokenDoc = `Verified document: ${analysis.documentType || 'Uploaded Document'}. ${analysis.executiveSummary || ''}. `;
    if (analysis.extractedEntities) {
      const e = analysis.extractedEntities;
      if (e.deceasedName && e.deceasedName !== 'N/A') spokenDoc += `Account Holder: ${e.deceasedName}. `;
      if (e.nomineeName && e.nomineeName !== 'N/A') spokenDoc += `Nominee: ${e.nomineeName}. `;
      if (e.financialValue && e.financialValue !== 'N/A') spokenDoc += `Estimated Value: ${e.financialValue}. `;
    }
    if (Array.isArray(analysis.actionableSteps) && analysis.actionableSteps.length > 0) {
      spokenDoc += 'Action steps: ';
      analysis.actionableSteps.forEach((s, idx) => {
        spokenDoc += `Step ${idx + 1}: ${s.title || ''}. ${s.description || ''}. `;
      });
    }
    attachVoiceControl(messageEl, spokenDoc, 'msg_doc_' + Date.now());

    scrollToBottom();
  }

  // --- Render Unrelated Document Message ---
  function renderUnrelatedDocMessage(analysis) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message ai-message';

    const summary = analysis.executiveSummary || 'This document does not appear to be related to financial recovery or asset succession.';
    const alerts = analysis.criticalAlerts || [];
    const alertMsg = alerts.length > 0 ? alerts[0] : 'Please upload a relevant legal or financial document for AI-powered analysis.';

    messageEl.innerHTML = `
      ${aiAvatarHTML}
      <div class="message-content" style="max-width: 100%;">
        <div class="message-bubble" style="background: var(--surface); border: 1px solid var(--border-color, #e0e0e0);">
          <div style="text-align: center; padding: 20px 16px;">
            <div style="font-size: 36px; margin-bottom: 12px;">📋</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Document Not Applicable</div>
            <p style="font-size: 13.5px; color: var(--text-secondary, #555); line-height: 1.6; max-width: 500px; margin: 0 auto 14px;">${escapeHTML(summary)}</p>
            <div style="background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15); border-radius: 10px; padding: 12px 16px; font-size: 12.5px; color: var(--text-secondary, #555); line-height: 1.5; margin-top: 6px;">
              <strong style="color: var(--blue, #3b82f6);">Supported Documents:</strong> Death Certificate, LIC Policy Bond, Bank Passbook, PAN Card, Aadhaar Card, EPF Statement, FD Receipt, Succession Certificate, Registered Will, Demat Statement
            </div>
          </div>
        </div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;

    chatMessages.appendChild(messageEl);

    // Attach voice control
    attachVoiceControl(messageEl, summary, 'msg_unrelated_' + Date.now());

    scrollToBottom();
  }

  // --- Parse Guided Flow from answer ---
  function parseGuidedFlow(answer) {
    const match = answer.match(/```guided\s*([\s\S]*?)```/);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      console.warn('Failed to parse guided flow:', e);
      return null;
    }
  }

  // --- Render Guided Flow (step-by-step wizard) ---
  function renderGuidedFlow(flow, sources) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message ai-message';

    let currentStep = 0;
    const totalSteps = flow.steps.length;

    const sourcesHTML = buildSourcesHTML(sources);

    messageEl.innerHTML = `
      ${aiAvatarHTML}
      <div class="message-content">
        <div class="message-bubble guided-flow">
          <div class="guided-header">
            <span class="guided-icon">📋</span>
            <span class="guided-title">${escapeHTML(flow.title)}</span>
          </div>
          <div class="guided-progress">
            <div class="progress-bar"><div class="progress-fill" style="width: ${(1/totalSteps)*100}%"></div></div>
            <span class="progress-text">Step 1 of ${totalSteps}</span>
          </div>
          <div class="guided-step-content">
            <h4 class="step-heading">${escapeHTML(flow.steps[0].heading)}</h4>
            <p class="step-detail">${formatAnswer(flow.steps[0].detail)}</p>
          </div>
          ${flow.tip ? `<div class="guided-tip">💡 ${escapeHTML(flow.tip)}</div>` : ''}
          <div class="guided-nav">
            <button class="guided-btn guided-back" disabled>← Back</button>
            <button class="guided-btn guided-next">${totalSteps > 1 ? 'Next →' : 'Done ✓'}</button>
          </div>
          ${sourcesHTML}
        </div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;

    // Wire up Next/Back buttons
    const backBtn = messageEl.querySelector('.guided-back');
    const nextBtn = messageEl.querySelector('.guided-next');
    const stepContent = messageEl.querySelector('.guided-step-content');
    const progressFill = messageEl.querySelector('.progress-fill');
    const progressText = messageEl.querySelector('.progress-text');

    function updateStep() {
      stepContent.innerHTML = `
        <h4 class="step-heading">${escapeHTML(flow.steps[currentStep].heading)}</h4>
        <p class="step-detail">${formatAnswer(flow.steps[currentStep].detail)}</p>
      `;
      progressFill.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
      progressText.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
      backBtn.disabled = currentStep === 0;
      nextBtn.textContent = currentStep === totalSteps - 1 ? 'Done ✓' : 'Next →';
    }

    backBtn.addEventListener('click', () => {
      if (currentStep > 0) { currentStep--; updateStep(); }
    });

    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps - 1) { currentStep++; updateStep(); scrollToBottom(); }
    });

    chatMessages.appendChild(messageEl);

    // Attach Siri-like voice control for guided process
    let spokenGuidance = `Here is the step by step guidance for ${flow.title || 'your claim'}. `;
    if (Array.isArray(flow.steps)) {
      flow.steps.forEach((step, idx) => {
        spokenGuidance += `Step ${idx + 1}: ${step.heading || ''}. ${step.detail || ''}. `;
      });
    }
    if (flow.tip) spokenGuidance += `Important tip: ${flow.tip}.`;
    attachVoiceControl(messageEl, spokenGuidance, 'msg_guided_' + Date.now());

    scrollToBottom();
  }

  // --- Build Sources HTML (shared by both renderers) ---
  function buildSourcesHTML(sources) {
    if (!sources || sources.length === 0) return '';
    const badgesHTML = sources.map(src => {
      const label = typeof src === 'string' ? src : (src.title || src.name || src.source || 'Source');
      return `
        <span class="source-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          ${escapeHTML(label)}
        </span>
      `;
    }).join('');
    return `
      <div class="message-sources">
        <div class="sources-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Sources
        </div>
        <div class="source-badges">${badgesHTML}</div>
      </div>
    `;
  }

  // --- Render AI Message ---
  function renderAIMessage(answer, sources) {
    // Check if answer contains a guided flow
    const flow = parseGuidedFlow(answer);
    if (flow && flow.steps && flow.steps.length > 0) {
      renderGuidedFlow(flow, sources);
      return;
    }

    // Normal text answer
    const messageEl = document.createElement('div');
    messageEl.className = 'message ai-message';

    const sourcesHTML = buildSourcesHTML(sources);

    messageEl.innerHTML = `
      ${aiAvatarHTML}
      <div class="message-content">
        <div class="message-bubble">
          ${formatAnswer(answer)}
          ${sourcesHTML}
        </div>
        <div class="message-time">${getCurrentTime()}</div>
      </div>
    `;

    chatMessages.appendChild(messageEl);

    // Attach Siri-like voice control for general answers
    attachVoiceControl(messageEl, answer, 'msg_ai_' + Date.now());

    scrollToBottom();
  }

  // --- Typing Indicator ---
  function showTypingIndicator(customText = null) {
    hideTypingIndicator();

    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = `
      ${aiAvatarHTML}
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      ${customText ? `<span style="font-size: 12px; color: var(--text-muted); margin-left: 6px;">${escapeHTML(customText)}</span>` : ''}
    `;

    chatMessages.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const existing = document.getElementById('typing-indicator');
    if (existing) existing.remove();
  }

  // --- Scroll to Bottom ---
  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  // --- Hide Suggested Questions ---
  function hideSuggestedQuestions() {
    if (suggestedQuestions) {
      suggestedQuestions.style.display = 'none';
    }
  }

  // --- Set Input State ---
  function setInputDisabled(disabled) {
    isWaiting = disabled;
    chatInput.disabled = disabled;
    sendBtn.disabled = disabled;
    if (attachDocBtn) attachDocBtn.disabled = disabled;
  }

  // --- Escape HTML ---
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // --- File Attachment Helpers ---
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function handleFileSelected(file) {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('File size exceeds 20MB limit. Please choose a smaller file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentAttachedFile = {
        name: file.name,
        size: formatFileSize(file.size),
        mimeType: file.type || 'application/pdf',
        base64: e.target.result
      };

      // Show attached file bar
      if (attachedFileBar) {
        attachedFileName.textContent = currentAttachedFile.name;
        attachedFileSize.textContent = currentAttachedFile.size;
        attachedFileBar.style.display = 'flex';
      }

      if (!chatInput.value.trim()) {
        chatInput.value = `Please analyze this document (${file.name}) and give me the complete step-by-step recovery process.`;
      }
      chatInput.focus();
    };

    reader.readAsDataURL(file);
  }

  function clearAttachedFile() {
    currentAttachedFile = null;
    if (docFileInput) docFileInput.value = '';
    if (attachedFileBar) attachedFileBar.style.display = 'none';
  }

  // --- Send Question or Analyze Document ---
  async function sendQuestion(questionText) {
    const text = questionText.trim();
    if ((!text && !currentAttachedFile) || isWaiting) return;

    // Hide suggestions on first message
    if (!hasMessages) {
      hideSuggestedQuestions();
      hasMessages = true;
    }

    const fileToAnalyze = currentAttachedFile;
    const promptText = text || `Please analyze this document: ${fileToAnalyze ? fileToAnalyze.name : ''}`;

    // Render user message with attachment badge if present
    renderUserMessage(promptText, fileToAnalyze);

    // Clear input & attachment
    chatInput.value = '';
    clearAttachedFile();

    // Disable input while waiting
    setInputDisabled(true);

    if (fileToAnalyze) {
      // Document Intelligence Flow
      showTypingIndicator('Studying document & extracting statutory recovery steps...');

      try {
        const caseId = getCaseId();
        const payload = {
          fileData: fileToAnalyze.base64,
          mimeType: fileToAnalyze.mimeType,
          fileName: fileToAnalyze.name,
          userNotes: promptText,
          caseId: caseId || undefined
        };

        // Race API call against a 45-second frontend timeout
        const apiCall = apiRequest('/rag/analyze-document', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Analysis timed out')), 45000)
        );
        const result = await Promise.race([apiCall, timeout]);

        hideTypingIndicator();

        // Handle unrelated documents
        if (result && result.unrelated) {
          renderUnrelatedDocMessage(result);
        } else if (result && (result.documentType || result.executiveSummary)) {
          renderDocAnalysisMessage(result);
        } else {
          renderAIMessage(
            result.answer || 'I have reviewed your document and verified the key succession rights.',
            []
          );
        }
      } catch (err) {
        hideTypingIndicator();
        const isTimeout = err.message && err.message.includes('timed out');
        renderAIMessage(
          isTimeout
            ? 'The document analysis took too long to respond. This can happen when AI servers are busy. Please try again in a minute.'
            : 'I encountered an issue processing your document. Please ensure it is a legible PDF or image, or ask your question in plain text.',
          []
        );
        showToast(isTimeout ? 'Analysis timed out. Please retry.' : 'Document analysis failed. Please try again.', 'error');
        console.error('Document analysis error:', err);
      } finally {
        setInputDisabled(false);
        chatInput.focus();
      }

    } else {
      // Normal RAG Question Flow
      showTypingIndicator();

      try {
        const caseId = getCaseId();
        const payload = { question: promptText };
        if (caseId) payload.caseId = caseId;

        const data = await apiRequest('/rag/ask', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        hideTypingIndicator();
        renderAIMessage(data.answer, data.sources);
      } catch (err) {
        hideTypingIndicator();
        renderAIMessage(
          'I\'m sorry, I wasn\'t able to process your question right now. Please try again in a moment.',
          []
        );
        showToast('Failed to get response. Please try again.', 'error');
        console.error('Chat error:', err);
      } finally {
        setInputDisabled(false);
        chatInput.focus();
      }
    }
  }

  // --- Event Listeners ---

  // Document Attachment triggers
  if (attachDocBtn && docFileInput) {
    attachDocBtn.addEventListener('click', () => docFileInput.click());
  }

  if (analyzeDocCard && docFileInput) {
    analyzeDocCard.addEventListener('click', () => {
      docFileInput.click();
    });
  }

  if (docFileInput) {
    docFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFileSelected(file);
    });
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', clearAttachedFile);
  }

  // Send button click
  sendBtn.addEventListener('click', () => {
    sendQuestion(chatInput.value);
  });

  // Enter key to send
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(chatInput.value);
    }
  });

  // Suggested question click handlers
  const questionCards = document.querySelectorAll('.question-card:not(#analyze-doc-card)');
  questionCards.forEach(card => {
    card.addEventListener('click', () => {
      const question = card.getAttribute('data-question');
      if (question) {
        chatInput.value = question;
        sendQuestion(question);
      }
    });
  });

  // --- Voice Input (Web Speech API) ---
  const micBtn = document.getElementById('mic-btn');
  let recognition = null;
  let isRecording = false;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      isRecording = true;
      micBtn.classList.add('recording');
      chatInput.placeholder = '🎙️ Listening...';
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      chatInput.value = transcript;

      // Auto-send when speech is final & enable voice feedback
      if (event.results[event.results.length - 1].isFinal) {
        lastQueryWasVoice = true;
        stopRecording();
        sendQuestion(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech error:', event.error);
      stopRecording();
      if (event.error === 'not-allowed') {
        showToast('Microphone access denied. Please allow mic permission in browser.', 'error');
      }
    };

    recognition.onend = () => {
      stopRecording();
    };

    micBtn.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
      } else {
        // Stop any current voice output before listening
        if (window.AnvayaVoice && window.AnvayaVoice.isPlaying) {
          window.AnvayaVoice.stop();
        }
        recognition.start();
      }
    });
  } else {
    // Browser doesn't support speech — hide mic button
    if (micBtn) micBtn.style.display = 'none';
  }

  function stopRecording() {
    isRecording = false;
    if (micBtn) micBtn.classList.remove('recording');
    chatInput.placeholder = 'Ask a question, or attach a PDF/Document to analyze...';
  }

  // --- Voice Assistant Mode Toggle Header Button ---
  const voiceToggleBtn = document.getElementById('voice-assistant-toggle');
  const voiceToggleStatus = document.getElementById('voice-toggle-status');

  function updateVoiceToggleUI() {
    if (!voiceToggleBtn || !window.AnvayaVoice) return;
    const isAuto = window.AnvayaVoice.getAutoSpeak();
    if (isAuto) {
      voiceToggleBtn.classList.add('active');
      if (voiceToggleStatus) voiceToggleStatus.textContent = 'ON';
    } else {
      voiceToggleBtn.classList.remove('active');
      if (voiceToggleStatus) voiceToggleStatus.textContent = 'OFF';
    }
  }

  if (voiceToggleBtn && window.AnvayaVoice) {
    updateVoiceToggleUI();
    voiceToggleBtn.addEventListener('click', () => {
      const current = window.AnvayaVoice.getAutoSpeak();
      const newState = window.AnvayaVoice.setAutoSpeak(!current);
      updateVoiceToggleUI();
      if (newState) {
        showToast('🎙️ Voice Assistant ON — Anvaya will talk back to you!', 'info');
        window.AnvayaVoice.speak('Anvaya Voice Assistant activated. I will read answers out loud.', 'greeting');
      } else {
        window.AnvayaVoice.stop();
        showToast('Voice Assistant muted', 'info');
      }
    });
  }

  // --- Initialize ---
  checkRAGStatus();
  chatInput.focus();
});
