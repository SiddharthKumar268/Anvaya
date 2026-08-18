/* ============================================================
   onboarding.js
   Feature 01 - Nominee Onboarding
   4 data steps + 1 confirmation step. No framework: plain DOM.
   ============================================================ */

(function () {
  const form = document.getElementById("onboarding-form");
  const steps = Array.from(form.querySelectorAll(".step"));
  const btnNext = document.getElementById("btn-next");
  const btnBack = document.getElementById("btn-back");
  const stepNav = document.getElementById("step-nav");

  const TOTAL_DATA_STEPS = 4;

  let current = 1;

  const RELATION_LABELS = {
    spouse: "Spouse",
    child: "Son / Daughter",
    parent: "Parent",
    sibling: "Sibling",
    other: "Other family member",
    "legal-heir": "Legal heir / court-appointed",
  };

  const PRIORITY_LABELS = {
    bank: "Bank accounts",
    insurance: "Insurance claim",
    pension: "Pension / employer benefits",
    property: "Property or asset transfer",
    minor: "Minor child involved",
    unsure: "Not sure where to start",
  };

  // ---------- progress path ----------

  function renderPath() {
    for (let i = 1; i <= TOTAL_DATA_STEPS; i++) {
      const dot = document.querySelector(`[data-lamp="${i}"]`);
      const label = document.querySelector(`[data-label="${i}"]`);
      if (!dot) continue;
      dot.classList.remove("completed", "current");
      if (i < current) dot.classList.add("completed");
      else if (i === current) dot.classList.add("current");
      if (label) label.classList.toggle("active", i <= current);
    }
    for (let i = 1; i < TOTAL_DATA_STEPS; i++) {
      const seg = document.querySelector(`[data-segment="${i}"]`);
      if (seg) seg.classList.toggle("completed", i < current);
    }
  }

  // ---------- step visibility ----------

  function showStep(n) {
    steps.forEach((s) => s.classList.toggle("active", Number(s.dataset.step) === n));
    current = n;
    renderPath();

    if (n === 5) {
      stepNav.style.display = "none";
    } else {
      stepNav.style.display = "flex";
      btnBack.style.visibility = n === 1 ? "hidden" : "visible";
      btnNext.textContent = n === 4 ? "Create my case" : "Continue";
    }

    if (n === 4) populateReview();
    const heading = steps.find((s) => Number(s.dataset.step) === n)?.querySelector("h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- validation ----------

  function setError(fieldEl, isError) {
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

      setError(form.querySelector('[data-field="fullName"]'), !fullName);
      if (!fullName) valid = false;

      setError(form.querySelector('[data-field="relation"]'), !relation);
      if (!relation) valid = false;

      const phoneOk = /^[6-9]\d{9}$/.test(phone);
      setError(form.querySelector('[data-field="phone"]'), !phoneOk);
      if (!phoneOk) valid = false;

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setError(form.querySelector('[data-field="email"]'), !emailOk);
      if (!emailOk) valid = false;
    }

    if (n === 2) {
      const deceasedName = form.deceasedName.value.trim();
      const dateOfPassing = form.dateOfPassing.value;
      const hasCertificate = form.querySelector('input[name="hasCertificate"]:checked');

      setError(form.querySelector('[data-field="deceasedName"]'), !deceasedName);
      if (!deceasedName) valid = false;

      setError(form.querySelector('[data-field="dateOfPassing"]'), !dateOfPassing);
      if (!dateOfPassing) valid = false;

      setError(form.querySelector('[data-field="hasCertificate"]'), !hasCertificate);
      if (!hasCertificate) valid = false;
    }

    if (n === 3) {
      const anyChecked = form.querySelectorAll('input[name="priorities"]:checked').length > 0;
      setError(form.querySelector('[data-field="priorities"]'), !anyChecked);
      if (!anyChecked) valid = false;
    }

    if (n === 4) {
      const consent = form.consent.checked;
      if (!consent) {
        valid = false;
        form.consent.closest(".ob-consent").style.color = "var(--red)";
      } else {
        form.consent.closest(".ob-consent").style.color = "";
      }
    }

    return valid;
  }

  // ---------- review ----------

  function populateReview() {
    setReview("fullName", form.fullName.value.trim());
    setReview("relation", RELATION_LABELS[form.relation.value] || "-");
    setReview("phone", form.phone.value.trim());
    setReview("email", form.email.value.trim());

    setReview("deceasedName", form.deceasedName.value.trim());
    setReview("dateOfPassing", formatDate(form.dateOfPassing.value));
    const cert = form.querySelector('input[name="hasCertificate"]:checked')?.value;
    setReview("hasCertificate", cert === "yes" ? "Have it" : "Not yet");

    const priorities = Array.from(form.querySelectorAll('input[name="priorities"]:checked'))
      .map((el) => PRIORITY_LABELS[el.value])
      .join(", ");
    setReview("priorities", priorities || "-");
  }

  function setReview(key, value) {
    const el = document.querySelector(`[data-review="${key}"]`);
    if (el) el.textContent = value || "-";
  }

  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  // ---------- edit links ----------

  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => showStep(Number(btn.dataset.edit)));
  });

  // ---------- submit ----------

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
    btnNext.textContent = "Creating your case...";

    const payload = collectPayload();

    // Store user info in localStorage for header/dashboard greeting
    if (payload.nominee && payload.nominee.fullName) {
      localStorage.setItem("anvaya_user", JSON.stringify({ name: payload.nominee.fullName }));
    }

    try {
      const result = await CaseApi.createCase(payload);
      const caseId = result.caseId || result.id || result._id || "ANV-2026-000000";
      localStorage.setItem("anvaya_case_id", caseId);
      document.getElementById("case-id-display").textContent = caseId;
      showStep(5);
    } catch (err) {
      console.warn("createCase failed, showing local fallback:", err.message);
      const fallbackId = "ANV-2026-" + String(Date.now()).slice(-6);
      localStorage.setItem("anvaya_case_id", fallbackId);
      document.getElementById("case-id-display").textContent = fallbackId;
      showStep(5);
    } finally {
      btnNext.disabled = false;
      btnNext.textContent = "Create my case";
    }
  }

  document.getElementById("go-to-dashboard").addEventListener("click", () => {
    window.location.href = "./dashboard.html";
  });

  // ---------- nav buttons ----------

  btnNext.addEventListener("click", () => {
    if (!validateStep(current)) return;
    if (current === 4) {
      submitCase();
    } else {
      showStep(current + 1);
    }
  });

  btnBack.addEventListener("click", () => {
    if (current > 1) showStep(current - 1);
  });

  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && current < 5) {
      e.preventDefault();
      btnNext.click();
    }
  });

  showStep(1);
})();