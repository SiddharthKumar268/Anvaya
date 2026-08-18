# Anvaya (अन्वय) — Comprehensive Project Documentation

**Financial Recovery Platform for Nominee Families**  
*Built for the living, not the dead.*

Final Year Project · B.Tech Information Technology  
Siddharth Goutam Kumar

---

## 1. The Name Statement & Core Philosophy

**Anvaya (अन्वय)** is a Sanskrit word meaning "connection," "logical connection," or "succession." In the context of this platform, Anvaya represents the vital, often fragile connection between a deceased individual's life's work and the financial security of their surviving family. 

When a person passes away, their wealth does not automatically transfer to their heirs; it gets locked behind bureaucratic walls. Anvaya stands for the logical, guided succession of these assets, ensuring that what was built for the family actually reaches the family. The platform’s core philosophy is to shift the cognitive and procedural burden away from the grieving family and onto a deterministic, automated system.

---

## 2. The Problem Statement

When a family loses its primary breadwinner in India, emotional grief is immediately compounded by financial paralysis. The core systemic issues include:

- **Information Asymmetry:** Nominees are frequently unaware of the deceased's complete financial footprint—hidden bank accounts, dormant mutual funds, employer-provided insurance policies, and post office savings.
- **Bureaucratic Labyrinth:** Transferring assets requires navigating complex, archaic legal processes. Families must discern between requiring a Death Certificate, a Legal Heir Certificate (issued by local Tehsildars for movable assets), or a full Succession Certificate (issued by Civil Courts for complex/disputed assets).
- **Unclaimed Wealth Epidemic:** Due to missed deadlines and lack of awareness, massive amounts of wealth are lost. For example, thousands of crores end up in the RBI's DEAF (Depositor Education and Awareness Fund) or remain unclaimed with the LIC and EPFO.
- **Vulnerability to Exploitation:** Grieving families, desperate for liquidity, are highly susceptible to fraud, exploitation by predatory "recovery agents," or simply abandoning legitimate claims due to overwhelming procedural friction.

---

## 3. The Solution Strategy

### How It Can Be Solved
Solving this systemic failure requires shifting from a disjointed, reactive, and manual process to a unified, proactive, and automated system. The ideal solution necessitates:
1. **Centralized Discovery:** A mechanism to locate and catalogue all financial footprints.
2. **Deterministic Workflows:** Breaking down complex legal jargon into actionable, sequential checklists based on conditional logic (e.g., Will vs. No Will).
3. **Automated Tracking:** Monitoring strict deadlines for insurance and statutory claims to prevent expiration.
4. **Intelligent Routing:** Handling edge cases automatically—such as minor nominees, pending loan liabilities, or missing persons.

### How Anvaya Solves It
Anvaya operates as a single, guided platform that models the user's specific, unique case. Through an initial onboarding state—capturing the presence of a will, the age of nominees, and identified assets—Anvaya dynamically generates a custom recovery roadmap. It provides document checklists, claim trackers, and precise legal path recommendations. By centralizing the tracking of EPF, LIC, Bank Accounts, and Property, Anvaya acts as a digital fiduciary, ensuring no asset is left unclaimed.

---

## 4. System Model & Technical Architecture

Anvaya is engineered as a Modular MERN stack application (MongoDB, Express.js, Node.js), explicitly avoiding heavy frontend frameworks to prioritize raw performance and maintainability.

### A. Technology Stack
- **Frontend Layer (Client):** HTML5, Vanilla JavaScript, and Vanilla CSS. 
  - *Rationale:* By omitting React or Vue, the application ensures zero framework overhead, consistent styling via a unified design system (`global.css`), and rapid execution. UI consistency (sidebar, header, authentication checks) is maintained via a shared utility script (`shared.js`).
- **Backend Layer (Server):** Node.js running an Express.js REST API.
  - *Rationale:* Provides a highly concurrent, non-blocking architecture perfect for handling I/O operations like database queries and document generation.
- **Database Layer:** MongoDB with Mongoose ODM.
  - *Rationale:* A flexible document schema perfectly suits the highly variable nature of financial assets and claims (e.g., an insurance claim has different fields than a property mutation).
- **Document Generation:** `PDFKit` for generating downloadable summaries and checklists.
- **Email Communications:** `Nodemailer` for OTPs, deadline alerts, and case updates.

### B. Project Structure & Data Flow
```text
anvaya/
├── client/                     # Vanilla JS Frontend Application
│   ├── pages/                  # HTML views (dashboard.html, claims.html, etc.)
│   ├── css/                    # Modular CSS (global.css + page-specific styles)
│   ├── js/
│   │   ├── api/                # Fetch wrappers (authApi.js, caseApi.js) interfacing with backend
│   │   ├── ui/                 # Page-specific DOM manipulation and render logic
│   │   └── shared.js           # Core utilities, JWT management, generic layout injection
│   └── assets/                 # SVGs, images, fonts
│
├── server/                     # Node.js REST API Backend
│   ├── config/                 # DB connection logic
│   ├── models/                 # Mongoose Schemas (User, Case, Asset, Claim, Document)
│   ├── controllers/            # Business logic (authController, caseController, etc.)
│   ├── routes/                 # Express route definitions pointing to controllers
│   ├── middleware/             # Security, auth verification, error handling
│   ├── utils/                  # PDF generation, email templates, masking
│   └── server.js               # Application entry point & middleware pipeline
```

### C. Security Posture Summary
Security is foundational, given the PII handled. Mitigations include:
- `express-rate-limit` to prevent brute-force attacks.
- `express-mongo-sanitize` and `xss-clean` to prevent NoSQL injection and Cross-Site Scripting.
- `helmet` for strict Content Security Policies (CSP) and HTTP header hardening.
- Stateless `JWT` authentication with `bcryptjs` password hashing.
*(For an exhaustive breakdown of the threat model, refer to `SECURITY.md`).*

---

## 5. Exhaustive Feature Breakdown (The 20 Modules)

### Phase 1: Initiation & Organization
1. **Nominee Onboarding Module:**  
   The critical entry point. It captures the deceased's demographic data, the primary claimant's relationship, date of death, and the existence of a registered Will. This data initializes the user's `Case` in MongoDB, setting the conditional flags that drive all subsequent UI logic.
2. **Document Checklist Generator:**  
   A dynamic engine that cross-references the onboarding data against statutory requirements. It outputs a precise, trackable checklist of required documents (e.g., Death Certificate, Aadhaar, PAN). If the claimant is a sibling or minor, it dynamically appends requirements like NOCs (No Objection Certificates) or Guardianship proofs.
3. **Progress Summary Dashboard:**  
   The central UI hub (`dashboard.html`). It aggregates data via the `/api/v1/cases/:id/dashboard` endpoint to display visual SVG progress rings, a financial summary of estimated vs. recovered funds, and explicitly highlights the 'Next Urgent Action' based on approaching deadlines.

### Phase 2: Claims & Financial Computation
4. **Claim Tracker (Kanban Board):**  
   A state-management interface (`claims.html`) allowing users to track discrete financial claims (Bank, LIC, EPF, Property). It utilizes a Board/List toggle view and calculates priority based on statutory deadlines, moving claims from 'Pending' to 'In Progress' to 'Done'.
5. **Benefit Calculator Engine:**  
   A complex mathematical module (`calculator.html`) estimating total statutory entitlements. It accepts inputs like last drawn salary and years of service to compute Gratuity (using the standard `(salary * 15 * years) / 26` formula), EPF balances, and insurance payouts, rendering a precise 'Estimated Receivable Amount'.
6. **Pension & Employer Benefits Tracker:**  
   Dedicated logic for post-demise employment benefits (`pension.html`). It calculates eligibility and estimates for EPS (Employee Pension Scheme), Family Pension, Leave Encashment, and EDLI (Employees' Deposit Linked Insurance). Includes a step-by-step EPFO timeline.

### Phase 3: Asset Discovery & Transfer
7. **Asset Transfer Module:**  
   An inventory management interface (`assets.html`) tracking the legal transfer of physical and financial assets. It categorizes assets by class (Property, Vehicles, Gold, Demat) and tracks the institutional requirements and current transfer status for each.
8. **UDGAM + Unclaimed Deposit Checker:**  
   An integration interface (`udgam.html`) guiding users on querying the RBI's UDGAM portal. It explains how inactive accounts (10+ years) transferred to the DEAF pool can be reclaimed, featuring mock API searches and step-by-step reclamation guides.
9. **No Nomination Pathway:**  
   A deterministic legal logic tree (`nomination.html`) triggered when assets lack registered nominees. It features a "Decision Helper" comparing the Legal Heir Certificate (for movable assets) vs. Succession Certificate (for complex/immovable assets), providing a 4-step wizard to navigate the courts.

### Phase 4: Protection & Optimization
10. **Minor Nominee Protection Module:**  
    Specialized routing invoked if the primary beneficiary is under 18. It details the legal framework under the Hindu Minority and Guardianship Act (or applicable personal law), outlining how to establish legal guardianship and open minor-specific bank accounts.
11. **Credit & Loan Liability Checker:**  
    A defensive module instructing the user on assessing the deceased's liabilities. It guides the extraction of a CIBIL/Credit report to identify outstanding secured/unsecured loans, preventing harassment by recovery agents.
12. **Fraud & Middleman Alert System:**  
    Proactive UI alerts integrated across the platform educating users on exploitation vectors. It flags standard "recovery agent" fee structures as predatory and provides direct institutional templates to bypass middlemen.
13. **Family Protection Score:**  
    An algorithmic metric (0-100) assessing the surviving family's financial resilience. It calculates the ratio of currently liquid, recovered assets against immediate short-term debt and estimated monthly living expenses.
14. **Missing Person / Presumed Death Handler:**  
    An edge-case module detailing the legal process under Section 108 of the Indian Evidence Act. It guides families on claiming assets when a person has been missing for 7+ years and is legally presumed dead, including filing FIRs and obtaining court decrees.
15. **Locker Seizure Prevention Alert:**  
    A time-sensitive warning system based on RBI guidelines. It alerts nominees about inactive safe deposit lockers, providing the exact forms required to access and empty the locker before the bank initiates a break-open procedure.
16. **FD Auto-Renewal Trap Breaker:**  
    A financial optimization tool alerting users to break auto-renewing Fixed Deposits immediately post-demise. It explains how to execute premature withdrawals without the standard penalty clauses, which are waived in the event of the account holder's death.

### Phase 5: Specialized Guides & Reporting
17. **Post Office Scheme Claim Guide:**  
    Dedicated procedural flows for Department of Post schemes (PPF, NSC, KVP, SCSS), accommodating their notoriously strict and unique bureaucratic requirements compared to standard commercial banking.
18. **PMJJBY / PMSBY Claim Guide:**  
    Specific flows for claiming the ₹2,00,000 payouts from the Pradhan Mantri Jeevan Jyoti Bima Yojana and Suraksha Bima Yojana. These are often auto-debited and forgotten; the module ensures families realize they are entitled to these government-backed insurance payouts.
19. **Knowledge Hub & Help Center:**  
    A searchable repository (`help.html`) of articles, standardized legal formats, and FAQs explaining Indian succession law, document procurement, and institutional processes in accessible language, featuring real-time client-side search filtering.
20. **Progress Reports & Export Module:**  
    An aggregation and export engine (`reports.html`). It provides a comprehensive module-wise completion breakdown and a vertical timeline of milestones achieved. Features PDF generation capabilities to download the full recovery journey report for sharing with legal counsel or financial advisors.

---

*Anvaya transforms the grief-stricken chaos of financial recovery into a structured, predictable, and secure digital journey.*