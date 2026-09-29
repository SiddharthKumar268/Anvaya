/* ============================================================
   ANVAYA - Onboarding Controller (Real-time Dynamic Wizard)
   Matches Central App Layout, Sidebar & Header
   ============================================================ */

(function () {
  // Initialize shared components
  if (typeof renderSidebar === 'function') {
    renderSidebar('onboarding');
  }
  if (typeof renderHeader === 'function') {
    renderHeader({
      greeting: 'Case Setup Wizard',
      subtitle: 'Complete these quick steps to build your custom recovery roadmap.'
    });
  }

  const form = document.getElementById("onboarding-form");
  const panels = Array.from(document.querySelectorAll(".step-panel"));
  const stepperItems = Array.from(document.querySelectorAll(".stepper-item"));
  const stepperFill = document.getElementById("stepper-fill");
  const badgeStepText = document.getElementById("badge-step-text");
  
  const btnNext = document.getElementById("btn-next");
  const btnNextText = document.getElementById("btn-next-text");
  const btnBack = document.getElementById("btn-back");
  const btnBackText = document.getElementById("btn-back-text");
  const btnSaveDraft = document.getElementById("btn-save-draft");
  const stepNav = document.getElementById("step-nav");

  const TOTAL_DATA_STEPS = 4;
  let current = 1;

  // Enforce max date on dateOfPassing (today or earlier)
  const dateInput = document.getElementById("dateOfPassing");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.max = today;
  }

  const RELATION_LABELS = {
    spouse: "Spouse (Husband / Wife)",
    child: "Son / Daughter",
    parent: "Parent (Mother / Father)",
    sibling: "Brother / Sister",
    "legal-heir": "Legal Heir / Succession Certificate",
    other: "Other Family Member / Nominee",
  };

  const PRIORITY_LABELS = {
    bank: "Bank Accounts & FDs",
    insurance: "Life & Health Insurance",
    pension: "EPFO & Pension Benefits",
    property: "Property & Real Estate",
    minor: "Minor Nominee / Child Heir",
    unsure: "General Recovery Guidance",
  };

  const STEP_TITLES = {
    1: "Step 1 of 4: Nominee Profile",
    2: "Step 2 of 4: Deceased Details",
    3: "Step 3 of 4: Priority Claims",
    4: "Step 4 of 4: Review & Confirm",
    5: "Case Successfully Initialized"
  };

  // ---------- Stepper Navigation & Visuals ----------

  function updateStepperUI(stepNum) {
    if (stepperFill) {
      const percentage = stepNum >= 4 ? 100 : (stepNum / TOTAL_DATA_STEPS) * 100;
      stepperFill.style.width = `${percentage}%`;
    }

    stepperItems.forEach((item) => {
      const stepIdx = Number(item.dataset.stepIndicator);
      item.classList.remove("active", "completed");
      if (stepIdx < stepNum) {
        item.classList.add("completed");
      } else if (stepIdx === stepNum) {
        item.classList.add("active");
      }
    });

    if (badgeStepText) {
      badgeStepText.textContent = STEP_TITLES[stepNum] || `Step ${stepNum} of 4`;
    }
  }

  function showStep(n) {
    panels.forEach((p) => {
      p.classList.toggle("active", Number(p.dataset.step) === n);
    });

    current = n;
    updateStepperUI(n);

    if (n === 5) {
      if (stepNav) stepNav.style.display = "none";
    } else {
      if (stepNav) stepNav.style.display = "flex";
      
      // Update Back Button
      if (n === 1) {
        if (btnBackText) btnBackText.textContent = "Back to Dashboard";
      } else {
        if (btnBackText) btnBackText.textContent = "Previous Step";
      }

      // Update Next Button
      if (n === 1) {
        if (btnNextText) btnNextText.textContent = "Continue to Step 2";
      } else if (n === 2) {
        if (btnNextText) btnNextText.textContent = "Continue to Step 3";
      } else if (n === 3) {
        if (btnNextText) btnNextText.textContent = "Review Case Details";
      } else if (n === 4) {
        if (btnNextText) btnNextText.textContent = "Open Case & Generate Checklist";
      }
    }

    if (n === 4) {
      populateReview();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Allow clicking completed stepper steps
  stepperItems.forEach((item) => {
    item.addEventListener("click", () => {
      const targetStep = Number(item.dataset.stepIndicator);
      if (targetStep < current || (targetStep === current + 1 && validateStep(current))) {
        showStep(targetStep);
      }
    });
  });

  // ---------- Field Validation ----------

  function setFieldError(fieldEl, isError) {
    if (!fieldEl) return;
    fieldEl.classList.toggle("error", isError);
  }

  function validateStep(n) {
    let valid = true;

    if (n === 1) {
      const fullName = form.fullName.value.trim();
      const relation = form.relation.value;
      const phone = form.phone.value.trim();
      const email = form.email.value.trim();

      const nameField = form.querySelector('[data-field="fullName"]');
      setFieldError(nameField, !fullName || fullName.length < 2);
      if (!fullName || fullName.length < 2) valid = false;

      const relField = form.querySelector('[data-field="relation"]');
      setFieldError(relField, !relation);
      if (!relation) valid = false;

      const phoneField = form.querySelector('[data-field="phone"]');
      const phoneOk = /^[6-9]\d{9}$/.test(phone);
      setFieldError(phoneField, !phoneOk);
      if (!phoneOk) valid = false;

      const emailField = form.querySelector('[data-field="email"]');
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setFieldError(emailField, !emailOk);
      if (!emailOk) valid = false;
    }

    if (n === 2) {
      const deceasedName = form.deceasedName.value.trim();
      const dateOfPassing = form.dateOfPassing.value;
      const hasCertificate = form.querySelector('input[name="hasCertificate"]:checked');

      const decNameField = form.querySelector('[data-field="deceasedName"]');
      setFieldError(decNameField, !deceasedName || deceasedName.length < 2);
      if (!deceasedName || deceasedName.length < 2) valid = false;

      const dateField = form.querySelector('[data-field="dateOfPassing"]');
      setFieldError(dateField, !dateOfPassing);
      if (!dateOfPassing) valid = false;

      const certField = form.querySelector('[data-field="hasCertificate"]');
      setFieldError(certField, !hasCertificate);
      if (!hasCertificate) valid = false;
    }

    if (n === 3) {
      const checkedBoxes = form.querySelectorAll('input[name="priorities"]:checked');
      const prioField = form.querySelector('[data-field="priorities"]');
      setFieldError(prioField, checkedBoxes.length === 0);
      if (checkedBoxes.length === 0) valid = false;
    }

    if (n === 4) {
      const consent = form.consent.checked;
      const consentBox = document.getElementById("consent-box");
      if (!consent) {
        valid = false;
        if (consentBox) {
          consentBox.style.borderColor = "#E74C3C";
          consentBox.style.background = "#FFF5F5";
        }
      } else {
        if (consentBox) {
          consentBox.style.borderColor = "rgba(37, 118, 166, 0.15)";
          consentBox.style.background = "rgba(37, 118, 166, 0.04)";
        }
      }
    }

    return valid;
  }

  // Clear errors on input
  form.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      const parentField = input.closest(".form-field");
      if (parentField) setFieldError(parentField, false);
    });
  });

  // ---------- Populate Review Step ----------

  function populateReview() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || "-";
    };

    setVal("rev-fullName", form.fullName.value.trim());
    setVal("rev-relation", RELATION_LABELS[form.relation.value] || form.relation.value || "-");
    setVal("rev-phone", form.phone.value.trim());
    setVal("rev-email", form.email.value.trim());

    setVal("rev-deceasedName", form.deceasedName.value.trim());
    
    const dateVal = form.dateOfPassing.value;
    if (dateVal) {
      const d = new Date(dateVal + "T00:00:00");
      setVal("rev-dateOfPassing", d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
    } else {
      setVal("rev-dateOfPassing", "-");
    }

    const certChecked = form.querySelector('input[name="hasCertificate"]:checked');
    setVal("rev-hasCertificate", certChecked && certChecked.value === "yes" ? "✓ Yes, official certificate available" : "○ Not yet obtained (Guidance needed)");

    const prioContainer = document.getElementById("rev-priorities-container");
    if (prioContainer) {
      const checkedBoxes = Array.from(form.querySelectorAll('input[name="priorities"]:checked'));
      if (checkedBoxes.length === 0) {
        prioContainer.innerHTML = '<span style="color:var(--text-secondary);font-size:13px;">No priority selected</span>';
      } else {
        prioContainer.innerHTML = checkedBoxes.map((cb) => {
          const label = PRIORITY_LABELS[cb.value] || cb.value;
          return `<span class="review-badge"><span style="color:var(--blue);">✓</span> ${label}</span>`;
        }).join("");
      }
    }
  }

  // Edit buttons in review
  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showStep(Number(btn.dataset.edit));
    });
  });

  // ---------- Submission ----------

  function collectPayload() {
    return {
      nominee: {
        fullName: form.fullName.value.trim(),
        relation: form.relation.value,
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
      },
      deceased: {
        fullName: form.deceasedName.value.trim(),
        dateOfPassing: form.dateOfPassing.value,
        hasCertificate: form.querySelector('input[name="hasCertificate"]:checked')?.value === "yes",
      },
      priorities: Array.from(form.querySelectorAll('input[name="priorities"]:checked')).map((el) => el.value),
    };
  }

  async function submitCase() {
    btnNext.disabled = true;
    if (btnNextText) btnNextText.textContent = "Creating your case...";

    const payload = collectPayload();

    if (payload.nominee && payload.nominee.fullName) {
      localStorage.setItem("anvaya_user", JSON.stringify({ name: payload.nominee.fullName }));
    }

    try {
      let caseId = null;
      if (window.CaseApi && typeof CaseApi.createCase === 'function') {
        const result = await CaseApi.createCase(payload);
        caseId = result.caseId || result.id || result._id;
      }
      
      if (!caseId) {
        caseId = "ANV-2026-" + String(Math.floor(100000 + Math.random() * 900000));
      }

      localStorage.setItem("anvaya_case_id", caseId);
      const disp = document.getElementById("case-id-display");
      if (disp) disp.textContent = caseId;

      // Clear draft on successful case creation
      localStorage.removeItem("anvaya_onboarding_draft");

      showStep(5);
    } catch (err) {
      console.warn("createCase API failed, using fallback:", err.message);
      const fallbackId = "ANV-2026-" + String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem("anvaya_case_id", fallbackId);
      const disp = document.getElementById("case-id-display");
      if (disp) disp.textContent = fallbackId;
      showStep(5);
    } finally {
      btnNext.disabled = false;
      if (btnNextText) btnNextText.textContent = "Open Case & Generate Checklist";
    }
  }

  // ---------- Draft Save & Restore ----------

  function saveDraft() {
    const payload = collectPayload();
    localStorage.setItem("anvaya_onboarding_draft", JSON.stringify(payload));
    
    if (btnSaveDraft) {
      const original = btnSaveDraft.textContent;
      btnSaveDraft.textContent = "✓ Saved!";
      btnSaveDraft.style.color = "#2E7D32";
      setTimeout(() => {
        btnSaveDraft.textContent = original;
        btnSaveDraft.style.color = "";
      }, 2000);
    }
  }

  function restoreDraft() {
    try {
      const draftStr = localStorage.getItem("anvaya_onboarding_draft");
      if (!draftStr) return;
      const draft = JSON.parse(draftStr);

      if (draft.nominee) {
        if (draft.nominee.fullName) form.fullName.value = draft.nominee.fullName;
        if (draft.nominee.relation) form.relation.value = draft.nominee.relation;
        if (draft.nominee.phone) form.phone.value = draft.nominee.phone;
        if (draft.nominee.email) form.email.value = draft.nominee.email;
      }

      if (draft.deceased) {
        if (draft.deceased.fullName) form.deceasedName.value = draft.deceased.fullName;
        if (draft.deceased.dateOfPassing) form.dateOfPassing.value = draft.deceased.dateOfPassing;
        if (draft.deceased.hasCertificate !== undefined) {
          const val = draft.deceased.hasCertificate ? "yes" : "no";
          const radio = form.querySelector(`input[name="hasCertificate"][value="${val}"]`);
          if (radio) radio.checked = true;
        }
      }

      if (Array.isArray(draft.priorities)) {
        draft.priorities.forEach((p) => {
          const cb = form.querySelector(`input[name="priorities"][value="${p}"]`);
          if (cb) cb.checked = true;
        });
      }
    } catch (e) {
      console.warn("Could not restore draft:", e);
    }
  }

  if (btnSaveDraft) {
    btnSaveDraft.addEventListener("click", saveDraft);
  }

  // Copy Case ID to clipboard
  const copyBtn = document.getElementById("copyCaseIdBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const caseIdText = document.getElementById("case-id-display")?.textContent || "";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(caseIdText).then(() => {
          copyBtn.innerHTML = `<span style="font-size:11px;font-weight:700;color:#2E7D32;">✓ Copied</span>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }, 2000);
        });
      }
    });
  }

  // ---------- Navigation Buttons ----------

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (!validateStep(current)) return;
      if (current === 4) {
        submitCase();
      } else {
        showStep(current + 1);
      }
    });
  }

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      if (current === 1) {
        window.location.href = "dashboard.html";
      } else {
        showStep(current - 1);
      }
    });
  }

  const goToDashboardBtn = document.getElementById("go-to-dashboard");
  if (goToDashboardBtn) {
    goToDashboardBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }

  // Keyboard navigation
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && current < 4 && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      btnNext.click();
    }
  });

  // Init
  restoreDraft();
  showStep(1);
})();