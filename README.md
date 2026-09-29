# Anvaya (अन्वय) — Master System Documentation & Technical Specification

**Autonomous Financial Recovery, Asset Succession & Legal Roadmap Platform for Nominee Families**  
*Deterministic, compassionate, and statutory asset transmission for surviving heirs.*

**Final Year Capstone Project · B.Tech Information Technology**  
**Author & Lead Architect:** Siddharth Goutam Kumar  
**Support & Inquiries:** `kumarsiddharth166@gmail.com`  
**Repository:** [https://github.com/SiddharthGoutamKumar/Anvaya.git](https://github.com/SiddharthGoutamKumar/Anvaya.git)

---

## 1. Executive Summary & Core Philosophy

### The Meaning of "Anvaya"
**Anvaya (अन्वय)** is a classical Sanskrit noun meaning *"unbroken connection," "logical sequence," "lineage,"* or *"reconciliation of parts into a meaningful whole."* In linguistics, it refers to arranging words in their natural prose order to extract meaning; in Indian jurisprudence and philosophy, it signifies causal succession and lawful inheritance.

### The Problem
When a primary breadwinner or family member passes away in India, the family is instantly plunged into an administrative, legal, and financial quagmire:
1. **Information Asymmetry:** Families rarely possess a unified ledger of the deceased’s financial footprint (inoperative bank accounts, employer EDLI insurance, EPF pension contributions, PPF/NSC certificates, demat shares, physical lockers).
2. **The ₹1,00,000+ Crore Unclaimed Wealth Crisis:** Over ₹1 Lakh Crore remains locked across government and institutional pools:
   - **RBI DEAF (Depositor Education and Awareness Fund):** Over ₹48,000+ Crores in inoperative bank deposits (>10 years).
   - **IEPF (Investor Education and Protection Fund):** Over ₹5,700+ Crores in unpaid dividends and millions of abandoned shares.
   - **LIC & Private Life Insurers:** Over ₹21,000+ Crores in unclaimed maturity and death claims.
   - **EPFO (Inoperative Accounts Pool):** Over ₹30,000+ Crores in dormant Provident Fund balances.
3. **Statutory Limitation Traps:** Critical statutory deadlines expire without warning:
   - **Section 39, Insurance Act 1938:** 3-year limitation window for filing life insurance claims post-demise before policies become contested or forfeited.
   - **Bank Locker Sealing Rule:** RBI directives require banks to freeze and seal safe deposit lockers upon death notification, requiring complex inventory procedures if not accessed promptly.
   - **EPF Form 10D & EDLI:** Restrictive windows for widow and children pension claims and employee life insurance (up to ₹7,00,000).
4. **Legal & Procedural Ambiguity:** Families struggle to determine whether they need a Municipal Death Certificate, a Tehsildar-issued Legal Heir / Surviving Member Certificate (for movable assets under bank limits), or a Civil Court Succession Certificate (for high-value holdings and real estate).
5. **Predatory Intermediaries:** Touts and unofficial agents exploit emotionally vulnerable families, charging 15% to 30% cuts on straightforward statutory claims.

### The Anvaya Solution
Anvaya shifts the burden from the grieving family onto a deterministic, automated, and intelligent software platform:
- **Centralized Discovery & Asset Inventory:** Tracks bank accounts, fixed deposits, life insurance, retirement pension, demat shares, mutual funds, real estate, and physical gold.
- **Deterministic Statutory Workflows:** Dynamically computes custom document checklists, claim workflows, and legal pathways.
- **Multimodal AI Vision OCR & Document Intelligence:** Google Gemini-powered engine that reads death certificates, insurance bonds, passbooks, and PAN cards, automatically extracting entities and checking off checklist items.
- **RBI UDGAM 30-Bank Unclaimed Deposit Engine:** Reclaims dormant bank accounts with exact/alias bank matching, AI account prediction, and 1-click formal DEAF claim letter generation.
- **Pension & Statutory Benefits Engine:** Computes Gratuity (1972 Act), Leave Encashment, Family Pension (EPS-95 / 7th Pay Commission), and tailored investment recommendations (SCSS, POMIS, PPF, NPS).
- **Comprehensive Audit & Progress Reports:** Dynamic synchronization of estate valuation, transferred vs. pending amounts, milestone timeline, advisor sharing brief, and print-ready PDF export.

---

## 2. High-Level System Architecture

Anvaya follows a decoupled, modular three-tier client-server architecture built for maximum uptime, zero framework overhead, and enterprise-grade resilience:

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER (Pure Vanilla JS)                              │
│                                                                                           │
│   [ Case Onboarding ]       [ Executive Dashboard ]       [ Claims Kanban & List ]        │
│   [ Document Checklist ]    [ Asset Inventory ]           [ Benefits & FD Calculator ]    │
│   [ Statement Discovery ]   [ Pension Engine ]            [ RBI UDGAM Finder ]            │
│   [ Succession Navigator ]  [ AI Legal Companion ]        [ Knowledge Hub ]               │
│   [ Reports & Progress ]    [ Profile & Settings ]        [ Login & Security Guard ]      │
│                                                                                           │
│   Shared Utilities: shared.js (Auth Guard, Dynamic Island, Token Storage, Toast System)   │
│   Design Tokens: global.css (Space Grotesk, Inter, Glassmorphism, 100% Vector SVGs)       │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │ HTTPS / JSON REST API (JWT Bearer Auth)
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                             SERVER TIER (Node.js & Express.js)                            │
│                                                                                           │
│   Middleware:                                                                             │
│   • Helmet Security Headers (Strict CSP)       • IP Rate Limiter (Brute Force Defense)    │
│   • Express Mongo Sanitize (NoSQL Injection)   • Centralized Error & Exception Handler    │
│   • Auth Guard (JWT Verification & Optional)   • Multer In-Memory Storage (CSV Parsing)   │
│                                                                                           │
│   Controller Layer:                                                                       │
│   • authController        • caseController        • assetController                       │
│   • calculatorController  • guideController       • safetyController                      │
│   • reportController      • settingsController    • ragController                         │
│   • discoveryController (Bank Statement CSV Analysis & Discovered Lead Confirmation)     │
│                                                                                           │
│   Services & Engines:                                                                     │
│   • discoveryService.js (Bank Statement Parsing, Cadence & 7-Rule Inference Engine)       │
│   • ragService.js (Gemini Multimodal Vision, In-memory Vector Store, Knowledge Search)    │
│   • udgamBanks.js (30 RBI-Connected Bank Registry with Alias Matching)                    │
│   • emailjsService (/api/v1/config/emailjs - Dynamic Client Key Distribution)             │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              │ Mongoose ODM (BSON)
┌─────────────────────────────────────────────▼─────────────────────────────────────────────┐
│                               DATABASE TIER (MongoDB)                                     │
│                                                                                           │
│   Collections:                                                                            │
│   • users        (Authentication, Profiles, Security Attempt Counters)                    │
│   • cases        (Case Profile, Nominee, Deceased, Declared Priorities, Locker Alerts)    │
│   • documents    (Statutory Checklist Items, Verification State, Categories)              │
│   • claims       (Institutional Claims, Limitation Deadlines, Kanban Statuses)            │
│   • assets       (Manual & Discovered Holdings, Valuations, Confidence & Evidence)        │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack & Architectural Decisions

| Layer | Technology | Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5, Modern ES6+ JavaScript, CSS3 | Zero bundle build steps, ultra-fast initial load times (<200ms), instant debugging, zero npm dependency rot on client. |
| **Styling & UI** | Custom CSS3 (`global.css`, `reports.css`, etc.) | Custom CSS custom properties (Tokens), CSS Grid, Flexbox, glassmorphism (`backdrop-filter`), print stylesheets (`@media print`). |
| **Iconography** | 100% Pure Inline Vector SVGs | Zero external icon font libraries, zero emojis, zero network roundtrips for icons, razor-sharp on high-DPI displays. |
| **Typography** | Inter & Space Grotesk (Google Fonts) | Space Grotesk for crisp institutional headings; Inter for maximum legal/tabular readability. |
| **Backend Runtime** | Node.js (v16+) & Express.js | Asynchronous, event-driven I/O ideal for concurrent document processing, RAG vector searches, and REST routing. |
| **Database** | MongoDB & Mongoose ODM | Document-oriented storage naturally accommodates variable asset fields, dynamic claim schemas, and evolving legal checklists. |
| **AI / Multimodal OCR** | Google Gemini API (`@google/generative-ai`) | Candidate models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`) providing high-speed multimodal OCR and legal entity extraction. |
| **Security Suite** | `bcryptjs`, `jsonwebtoken`, `helmet`, `express-rate-limit`, `express-mongo-sanitize` | Defends against OWASP Top 10 vulnerabilities: NoSQL injections, XSS, brute-force attacks, and session hijacking. |
| **Statement Discovery** | `csv-parse`, `multer` (In-Memory) | In-memory CSV parsing without disk I/O, regex-based Indian bank column mapping, and median cadence inference. |
| **Email Delivery** | EmailJS Browser SDK (`@emailjs/browser`) | Client-side real-time OTP dispatch via dynamic server credentials, bypassing restrictive SMTP blocks. |

---

## 4. Complete Project Directory Structure

```text
Anvaya/
├── client/
│   ├── assets/                     # Brand logos, SVG graphics, illustrations
│   ├── css/                        # Dedicated, modular stylesheet per view
│   │   ├── global.css              # Universal design tokens, navbar, typography, reset
│   │   ├── auth.css                # Authentication forms and password recovery styling
│   │   ├── Onboarding.css          # Multi-step onboarding wizard layout
│   │   ├── dashboard.css           # Stat cards, progress meters, milestone timeline
│   │   ├── claims.css              # Kanban board and list view styling
│   │   ├── documents.css           # Document checklist cards and upload controls
│   │   ├── calculator.css          # Benefit calculators and interactive sliders
│   │   ├── pension.css             # EPFO, EPS-95, and employer benefit styling
│   │   ├── assets.css              # Asset transmission guides, cards, and modal UI
│   │   ├── discovery.css           # Statement analyzer, upload zone, lead cards & confidence meters
│   │   ├── udgam.css               # RBI UDGAM checker, chips, AI detective, modal UI
│   │   ├── nomination.css          # Legal heir vs. succession decision matrix
│   │   ├── chat.css                # AI chat interface and markdown rendering
│   │   ├── help.css                # Knowledge hub and interactive guide reader modal
│   │   ├── reports.css             # Progress reporting, portfolio table & print styles
│   │   └── settings.css            # Account settings, profile editor, data export UI
│   ├── js/
│   │   ├── shared.js               # Universal layout, auth guard, Dynamic Island, toasts
│   │   ├── Onboarding.js           # Multi-step case wizard and local draft persistence
│   │   ├── voiceAssistant.js       # Web Speech API speech-to-text / text-to-speech
│   │   ├── api/
│   │   │   ├── anvayaApi.js        # Core API client (Assets, UDGAM, Calculator, Reports, Discovery)
│   │   │   ├── authApi.js          # Authentication API (login, register, forgot-password)
│   │   │   └── caseApi.js          # Case API (CRUD, claims, documents, AI summary)
│   │   └── ui/
│   │       ├── dashboard.js        # Progress ring animations, search, claim modal
│   │       ├── claims.js           # Kanban drag/toggle and status updates
│   │       ├── documents.js        # Document checklist collection & AI scanner intake
│   │       ├── calculator.js       # Gratuity, FD, PMJJBY, and investment recommendations
│   │       ├── pension.js          # Pension eligibility filters and EPFO steps
│   │       ├── assets.js           # Asset transmission flows, locker seal alert
│   │       ├── discovery.js        # Bank statement CSV parser, cadence detection & lead confirmation
│   │       ├── udgam.js            # 30-bank UDGAM checker, AI detective, claim letters
│   │       ├── nomination.js       # Legal hierarchy decision tree & court wizard
│   │       ├── chat.js             # AI RAG chat stream and citations
│   │       ├── help.js             # Knowledge hub reader, SLA badges, copy buttons
│   │       ├── reports.js          # Live case audit, portfolio table, advisor share modal
│   │       └── settings.js         # Profile updates, password changes, data backup/wipe
│   └── pages/                      # HTML Views
│       ├── login.html              # Authentication & EmailJS Real OTP Password Recovery
│       ├── register.html           # User Registration & Profile Initiation
│       ├── Onboarding.html         # 4-Step Guided Case Setup Wizard
│       ├── dashboard.html          # Central Overview Hub & Action Center
│       ├── claims.html             # Claims Kanban & Status Tracker
│       ├── documents.html          # Dynamic Statutory Document Checklist & AI Scanner
│       ├── calculator.html         # Gratuity, FD & Statutory Benefit Calculator
│       ├── pension.html            # EPFO & Family Pension Recovery Tracker
│       ├── assets.html             # Asset Inventory & Transmission Workflows
│       ├── discovery.html          # Bank Statement Discovery & Hidden Asset/Liability Engine
│       ├── udgam.html              # RBI UDGAM Unclaimed Deposit Recovery Engine
│       ├── nomination.html         # Succession Laws & Nomination Legal Navigator
│       ├── chat.html               # Anvaya AI Legal & Recovery Assistant
│       ├── help.html               # Knowledge Base & Regulatory Escalations
│       ├── reports.html            # Executive Audit Summary, Portfolio & PDF Export
│       └── settings.html           # User Profile, Security & Account Settings
│
├── server/
│   ├── config/
│   │   └── db.js                   # MongoDB connection logic with IPv4 fallback
│   ├── controllers/
│   │   ├── authController.js       # Auth, JWT generation, password resets & lockout
│   │   ├── caseController.js       # Case creation, auto-seeding, claims & checklist
│   │   ├── assetController.js      # Asset CRUD, transmission guides, locker alerts
│   │   ├── calculatorController.js # Statutory benefits, FD penalty rules, recommendations
│   │   ├── guideController.js      # Post office schemes, knowledge articles, legal guides
│   │   ├── safetyController.js     # Fraud alerts, protection score, presumed death rules
│   │   ├── reportController.js     # Case milestone aggregation and progress analytics
│   │   ├── settingsController.js   # Profile CRUD, password updates, data export/delete
│   │   ├── discoveryController.js  # Bank statement analysis runner & lead confirmation
│   │   └── ragController.js        # Gemini AI document analysis & knowledge Q&A
│   ├── data/
│   │   └── udgamBanks.js           # 30 RBI UDGAM banks registry with aliases & URLs
│   ├── middleware/
│   │   ├── authMiddleware.js       # Bearer JWT verification (protect & optionalAuth)
│   │   ├── errorMiddleware.js      # Centralized error handler and payload sanitization
│   │   ├── logger.js               # Request logging middleware
│   │   ├── rateLimiter.js          # IP-based rate limiting
│   │   └── sanitizeMiddleware.js   # Input sanitization against NoSQL injection / XSS
│   ├── models/
│   │   ├── User.js                 # User profile schema with failed login tracking
│   │   ├── Case.js                 # Primary case schema (deceased, nominee, assets)
│   │   ├── Document.js             # Document item schema with checklist status
│   │   ├── Claim.js                # Financial claim schema with statutory deadlines
│   │   ├── Asset.js                # Asset schema with manual & discovered provenance
│   │   └── Scheme.js               # Welfare & statutory scheme definitions
│   ├── routes/
│   │   ├── authRoutes.js           # /api/v1/auth
│   │   ├── caseRoutes.js           # /api/v1/cases
│   │   ├── assetRoutes.js          # /api/v1/assets
│   │   ├── calculatorRoutes.js     # /api/v1/calculators
│   │   ├── guideRoutes.js          # /api/v1/guides
│   │   ├── safetyRoutes.js         # /api/v1/safety
│   │   ├── reportRoutes.js         # /api/v1/reports
│   │   ├── settingsRoutes.js       # /api/v1/settings
│   │   ├── discoveryRoutes.js       # /api/v1/discovery
│   │   └── ragRoutes.js            # /api/v1/rag
│   ├── services/
│   │   ├── discoveryService.js     # In-memory bank statement parsing & cadence inference
│   │   └── ragService.js           # Google Gemini Multimodal Vision & RAG Engine
│   ├── utils/
│   │   ├── accountLockout.js       # Brute force defense policy (5 attempts, 15 min lock)
│   │   ├── email.js                # Nodemailer transport configuration
│   │   ├── generatePDF.js          # PDFKit document generator
│   │   └── emailTemplates/         # Responsive HTML email templates
│   ├── .env                        # Environment variables configuration
│   └── server.js                   # Application bootstrap and middleware pipeline
│
├── README.md                       # Master System Documentation (This Document)
└── SECURITY.md                     # Security Architecture and Threat Model
```

---

## 5. Detailed Feature Breakdown (Module by Module)

### 5.1. Authentication & Security Guard
- **JWT Authentication:** Stateless, signed JSON Web Tokens (`HS256`) with a 30-day expiration window.
- **Bcrypt Salted Hashing:** Passwords hashed with `bcryptjs` using 10 salt rounds; plaintext passwords never touch the database.
- **Brute-Force Account Lockout:** Tracks failed login attempts per account. After 5 consecutive failed attempts, the account is automatically locked for 15 minutes (`accountLockout.js`).
- **Live EmailJS Real-Time OTP Password Recovery (`login.html`):**
  - **Zero Hardcoded Keys:** Client-side source code contains zero exposed secrets. Public credentials (`serviceId`, `templateId`, `publicKey`) are dynamically provided by the backend via `/api/v1/config/emailjs` backed by `.env`.
  - **In-Memory Cryptographic OTP:** Generates a random 6-digit verification code with a 10-minute expiry timestamp.
  - **Direct Client Dispatch:** Dispatches branded, responsive HTML emails to the claimant's verified inbox using `@emailjs/browser` without requiring an intermediate SMTP server.
  - **Branded Institutional Template:** Custom-crafted HTML email with Anvaya's palette (`#0B2854`), high-legibility spaced monospace OTP display, and universal email client compatibility (Gmail, Outlook, Apple Mail).
- **Security Hardening:**
  - `helmet`: Enforces Content Security Policy (CSP), restricts frame ancestors (`X-Frame-Options: DENY`), and sets `X-Content-Type-Options: nosniff`.
  - `express-mongo-sanitize`: Strips dangerous `$` and `.` characters from request payloads to prevent NoSQL query injection attacks.
  - `rateLimiter`: Limits clients to 100 requests per 15-minute window per IP to defend against DoS attacks.

### 5.2. Guided Case Onboarding Wizard (`Onboarding.html`)
- **4-Step Guided Wizard:**
  1. **Step 1: Nominee / Claimant Profile:** Full name, legal relationship to deceased (Spouse, Child, Parent, Sibling, Legal Heir), contact phone number, and official email for statutory alerts.
  2. **Step 2: Deceased Family Member Details:** Full name (as recorded in bank passbooks/policies), date of demise (with date validation preventing future dates), and death certificate availability flag.
  3. **Step 3: Recovery Priorities:** Category checkboxes (Bank Accounts & FDs, Life & Health Insurance, EPFO & Pension Benefits, Property & Real Estate, Minor Nominee Protection, General Guidance).
  4. **Step 4: Review & Confirm:** Interactive review cards with single-click edit shortcuts for each previous step, and statutory consent confirmation.
- **Draft Autosave & Restoration:** In-progress wizard states are automatically saved to `localStorage` (`anvaya_onboarding_draft`) so accidental page reloads or tab closures never cause data loss.
- **Instant Auto-Seeding Pipeline:** Once submitted, the backend immediately initializes the case in MongoDB, generating standard checklist documents, active claims with limitation countdowns, and declared asset records.

### 5.3. Executive Overview Dashboard (`dashboard.html`)
- **Dynamic Island Header:** Real-time typewriter header component greeting the user by name and cycling through comforting, informative Hinglish reminders (*"Aapka data 256-bit encrypted hai"*, *"Hum har kadam par aapke sath hain"*).
- **Animated SVG Progress Rings:** Dynamically calculates:
  - Overall Recovery Percentage
  - Documents Collected vs. Total Required
  - Claims Settled vs. Total Tracked
- **Portfolio Financial Metrics:** Real-time calculation of **Total Estate Value**, **Amount Settled / Transferred**, and **Amount Under Recovery / In-Progress**.
- **Urgent Action Engine:** Automatically surfaces the nearest statutory limitation deadline (e.g. *"File LIC claim before 15 March 2027 under Section 39"*).
- **Claims Kanban & Table Views:** Filter claims by category (Bank, Insurance, Pension, Property, Post Office, Demat) or status (Pending, In Progress, Done) with instant keyword search.
- **Interactive Claim Detail Modal:** Full-screen modal to review claim references, required forms, servicing authority, and update status with immediate dashboard recalculation.

### 5.4. Master Document Checklist & AI Document Scanner (`documents.html`)
- **Dynamic Case-Specific Checklist:** Generates required documents based on declared assets (e.g., Death Certificate, Nominee KYC, Form 3783 for LIC, Form 10D for EPFO, DA-2 for Banks, Legal Heir Certificate for Property).
- **Category & Status Filters:** Filter by Common, Bank, Insurance, Property, or Other, and toggle between All, Collected (Done), and Pending Action.
- **Multimodal AI Document Scanner:**
  - Accepts PDFs, scanned documents, and images (PNG, JPG, WebP) up to 20MB.
  - Passes document base64 payload to Google Gemini Vision (`POST /api/v1/rag/analyze-document`).
  - Automatically identifies document type, confidence score, deceased name, nominee name, policy/account number, and monetary values.
  - Detects critical traps (e.g., Section 39 limitation window expiring, name spelling discrepancies with PAN).
  - **Auto-Matching Engine:** Automatically matches the analyzed document with the corresponding checklist item, marking it as **Collected / Verified** and updating case completion metrics.
  - 100% Vector SVG iconography: Replaced all legacy unicode emojis and stickers with accessible SVGs.

### 5.5. Statutory Claims Tracker (`claims.html`)
- **Dual Display Modes:** Switch between an interactive drag-and-drop Kanban Board and a high-density Table View.
- **Statutory Limitation Countdown:** Computes exact days remaining before claim windows expire:
  - **LIC & Private Life Insurance:** 3-year statutory limitation under Section 39 of the Insurance Act.
  - **Bank Inoperative Deposits:** 10-year transfer window to the RBI DEAF pool.
  - **EPFO EPF / EPS:** 1-year and 3-year submission guidelines for deceased claims.
- **Interactive Claim Detail Drawer:** View servicing branch/portal, required companion forms, and change state (`pending` → `in-progress` → `done`).

### 5.6. Asset Transmission & Locker Protection Hub (`assets.html`)
- **Multi-Category Asset Inventory:** Add, edit, and track Bank Accounts, Fixed Deposits, Life Insurance Policies, Demat Shares / Mutual Funds, Real Estate, Vehicles, and Gold.
- **Real-Time Valuation Aggregator:** Computes total valuation across all discovered holdings and calculates transfer percentages.
- **15-Day Bank Locker Sealing Warning:** Calculates days remaining before bank lockers are frozen following death notice, providing actionable guidance for inventory access before formal sealing.
- **Loan Liability Shield:** Clear legal breakdown of debt obligations:
  - *Unsecured Loans & Credit Cards:* Debt dies with the borrower; legal heirs cannot be forced to pay from personal assets.
  - *Secured Mortgages:* Bank can only attach the mortgaged property, not the personal wealth of legal heirs.
  - *Co-Applicant / Joint Loans:* Surviving co-borrower remains legally liable.
- **1-Click AI Transmission Claim Letter Generator:** Generates a formal, legally structured claim and transmission letter addressed to the Branch Manager, Registrar, or Insurance Officer with complete account numbers, deceased details, and enclosed statutory annexures.

### 5.7. Statutory Benefits & Financial Calculator (`calculator.html`)
- **Payment of Gratuity Act 1972 Formula:**
  $$\text{Gratuity} = \frac{\text{Last Drawn Basic + DA} \times 15 \times \text{Years of Service}}{26}$$
  Enforces statutory ₹20,00,000 ceiling and handles death gratuity slab rates.
- **Leave Encashment Engine:** Computes payout on accumulated earned leave up to statutory limits (300 days).
- **FD Premature Closure Penalty Waiver Guide:** Guides nominees on invoking RBI guidelines where banks cannot levy premature withdrawal penalty on deposits settled following account holder demise.
- **Investment Recommendations Engine (`POST /api/v1/calculators/recommendations`):**
  - **SCSS (Senior Citizen Savings Scheme):** 8.2% p.a., quarterly interest payouts, sovereign guarantee.
  - **POMIS (Post Office Monthly Income Scheme):** 7.4% p.a., guaranteed monthly income for household expenses.
  - **PPF (Public Provident Fund):** 7.1% p.a., tax-free EEE status under Section 80C.
  - **FD Ladder Strategy:** 7.0% weighted average return splitting capital across 1, 2, 3, and 5-year maturities.
  - **AI Gemini Recommendations:** Generates 2 personalized recommendations tailored to nominee age, risk profile, and monthly expenses.

### 5.8. Pension & Family Pension Engine (`pension.html`)
- **Multi-Employer Support:** Covers Central Government (CCS Pension Rules), State Governments, Defence Personnel, PSUs, and EPFO EPS-95 private sector pensions.
- **Enhanced vs. Normal Family Pension:**
  - *Enhanced Pension:* 50% of last drawn pay for up to 10 years post-demise (or until the deceased would have reached age 67).
  - *Normal Pension:* 30% of last drawn pay following the enhanced period.
- **EPFO EPS-95 Formula:**
  $$\text{Monthly Pension} = \frac{\text{Pensionable Salary} \times \text{Pensionable Service}}{70}$$
  Calculates minimum widow pension (₹1,000/mo minimum) and children pension allowances (25% of widow pension each, up to 2 children).
- **Interactive Pension Calculation:** Visualizes total expected monthly payouts and lifetime pension value.

### 5.9. RBI UDGAM Unclaimed Wealth Recovery Engine (`udgam.html`)
- **30 RBI-Connected Banks Database (`server/data/udgamBanks.js`):**
  Comprehensive registry including State Bank of India, Punjab National Bank, Bank of Baroda, Canara Bank, HDFC Bank, ICICI Bank, Axis Bank, Kotak Mahindra Bank, Central Bank of India, Union Bank of India, Indian Overseas Bank, and major regional rural banks.
- **Exact & Alias Fuzzy Matching:** Instant matching on common abbreviations (`SBI`, `BOI`, `PNB`, `BOB`, `CBI`, `IOB`, `UBI`).
- **3 Dynamic Search States:**
  1. *Deposits Found:* Displays bank logo, portal deep-link, DEAF reference numbers, and 1-click action buttons.
  2. *Zero Deposits Found:* Compassionate empty state guiding users to check alternative family names, married surnames, or unlisted banks.
  3. *Unlisted Bank Guidance:* Actionable roadmap for regional cooperative banks not yet integrated into the central RBI portal.
- **AI Detective Account Predictor:** Analyzes deceased employer type, age, and lifestyle profile to predict likely banks where forgotten accounts may exist.
- **1-Click Formal DEAF Claim Form Generator:** Formats an official claim letter under the RBI Depositor Education and Awareness Fund Scheme 2014 ready for submission to the branch manager.
- **1-Click Sync to Asset Tracker:** Single-click transfer of discovered UDGAM balances into the user's active Case Asset Inventory.

### 5.10. Succession Laws & Nomination Legal Navigator (`nomination.html`)
- **Multi-Religion Legal Matrix:** Covers Hindu Succession Act 1956 (amended 2005), Muslim Personal Law (Shariat), Indian Succession Act 1925 (Christian/Parsi/Civil marriages).
- **Interactive Heir Distribution Calculator:** Visualizes statutory share entitlement among Class I heirs (Spouse, Sons, Daughters, Mother) in equal proportions under Section 10 of the Hindu Succession Act.
- **Legal Heir vs. Succession Certificate Matrix:**
  - *Legal Heir Certificate (Surviving Member Certificate):* Issued by Tehsildar/SDM within 1–2 months; suitable for bank deposits, insurance claims, and PF transfers.
  - *Succession Certificate:* Issued by Civil Court under Indian Succession Act within 6–24 months; mandatory for disputed claims, stocks/mutual funds without nomination, and immovable property.
- **Civil Court 4-Step Petition Roadmap:** Step-by-step guidance on filing court petitions, newspaper citations, valuation verification, and certificate grant.

### 5.11. Anvaya AI Companion & Contextual RAG Bot (`chat.html`)
- **Retrieval-Augmented Generation (RAG):** In-memory cosine similarity vector store indexed with hundreds of statutory knowledge chunks on Indian succession, banking circulars, and insurance rules.
- **Case-Context Aware:** When logged in, Anvaya AI answers queries in the context of the user’s specific declared assets and nominee relationships.
- **Multilingual Support:** Supports English, Hindi, and Hinglish queries with compassionate, jargon-free explanations.
- **Voice Interaction:** Web Speech API integration for hands-free voice input and speech synthesis output (`voiceAssistant.js`).

### 5.12. Reports & Progress Audit Page (`reports.html` - Recently Overhauled)
- **Auto-Healing Case Synchronization:** If a case is newly created or lacks data, the backend automatically initializes documents, statutory claims, and declared assets so the screen is **never empty with ₹0**.
- **Real Valuation Breakdown:** Sums actual approximate values from the `Asset` model:
  - *Estimated Total Estate:* Total value across all discovered assets.
  - *Amount Transferred / Settled:* Actual value of completed claims and transferred assets.
  - *Amount Under Recovery:* Pending balance currently being pursued.
  - *Visual Horizontal Comparison Bar:* Color-coded percentage indicators of settled vs. pending estate wealth.
- **Interactive Module Progress Cards:** Direct links to Documents, Claims, Assets, and UDGAM with real-time verification fractions (`8/12`).
- **Discovered Assets & Claims Portfolio Table:** Clean tabular overview of all declared holdings, institutions, estimated valuations, and settlement badges.
- **Statutory Milestone Timeline:** Chronological history of case creation, checklist generation, collected documents, claim submissions, and future limitation deadlines.
- **Case Profile & Heirs Card:** Displays real Case Reference ID (click-to-copy), Nominee / Claimant details, Deceased Member details, Date of Demise, and Priority chips.
- **Executive Advisor Sharing Modal:** Generates an executive brief ready to copy or email to a legal advisor, chartered accountant, or bank officer.
- **Print-Ready & PDF Export:** Dedicated `@media print` CSS that hides navigation, sidebar, and buttons, producing an official printable statement with institutional headers.

### 5.13. Knowledge Base & Regulatory Escalations (`help.html`)
- **Categorized Guide Library:** Guides for Banking Claims, Insurance Claims, EPFO Pension, Demat Transmission, and Property Mutation.
- **Regulatory Ombudsman Directory:** Direct contacts and complaint filing portals for:
  - RBI Banking Ombudsman (Complaint Management System - CMS / 14448)
  - IRDAI Bima Bharosa Insurance Ombudsman
  - EPFO CPGRAMS / EPFiGMS Portal
  - SEBI SCORES Portal for Securities & Demat Claims

### 5.14. Account Management & Privacy Hub (`settings.html`)
- **Profile Customization:** Edit name, contact email, phone number, and residential state.
- **Security & Password Management:** Change account passwords with bcrypt validation.
- **One-Click Data Export:** Download a complete JSON archive of user profile, case data, documents, claims, and declared assets.
- **GDPR-Compliant Account Erasure:** Complete cascade deletion of the user account, associated cases, documents, claims, and asset records from MongoDB.

### 5.15. Statement Discovery & Hidden Wealth Inference Engine (`discovery.html`)
- **The Core Problem Solved:** Families rarely have complete visibility into all insurance policies, mutual fund SIPs, loans, or demat holdings created by the deceased.
- **100% In-Memory & Privacy-Guaranteed:** Bank statement files are parsed purely in RAM buffers via `multer.memoryStorage()`. Raw financial transactions are never written to disk, never logged, and never passed to external AI services.
- **Multi-Bank Tolerance & Preamble Detection:** Automatically strips metadata preamble lines (account number, customer name, branch address) from Indian bank statement CSV exports (SBI, HDFC, ICICI, Axis, Kotak, PNB).
- **Indian Date & Column Parser:** Native support for `DD/MM/YYYY`, `DD-MM-YYYY`, `DD-MMM-YYYY` (e.g., `15-Jan-2025`), as well as variations like `Withdrawal Amt.`, `Deposit Amt.`, `Amount (Dr)`, `Particulars`, and `Narration`.
- **7-Rule Pattern Dictionary:**
  1. **Life Insurance Policy (`debit`):** Matches `LIC`, `HDFC LIFE`, `SBI LIFE`, `ICICI PRU`, `MAX LIFE`, `BAJAJ ALLIANZ`.
  2. **Mutual Fund Folio (`debit`):** Matches `BSE STAR`, `SIP`, `NACH MF`, `CAMS`, `KFIN`, `MUTUAL`.
  3. **Loan / Liability (`debit`):** Matches `EMI`, `ACH D`, `LOAN`, `HOME FIN`, `BAJAJ FIN`.
  4. **Demat Shares (`credit`):** Matches `DIVIDEND`, `IEPF`, `NSDL`, `CDSL`.
  5. **PPF / NPS / Fixed Deposit (`credit`):** Matches `PPF`, `NPS`, `INT PD`, `INTEREST`.
  6. **Employer & Retirals (`credit`):** Matches `SALARY`, `SAL CR`, `PAYROLL` (infers EPF, Gratuity, and EDLI claims).
  7. **Rental Property (`credit`):** Matches `RENT` credits.
- **Cadence & Interval Detection:** Computes median gap in days between recurring transactions to detect payment intervals:
  - *Monthly:* 22–38 days (handles 28-day Feb and weekend shifts)
  - *Quarterly:* 75–105 days
  - *Half-Yearly:* 165–200 days
  - *Yearly:* 340–395 days (handles 30-day insurance grace periods)
- **Confidence Scoring Algorithm:**
  $$\text{Confidence} = 0.40 (\text{Base}) + 0.30 (\text{Cadence Match}) + 0.20 (\text{Stable Amount } CV < 0.05) + 0.10 (\text{Count } \ge 4)$$
- **Evidence Drawer:** Shows the last 3 transaction dates, descriptions, and amounts for full auditability and verification before filing.
- **1-Click Conversion Pipeline:** Confirming a lead writes an `Asset` (with `source: 'discovered'`, `confidence`, and `evidence`) and attaches a statutory `Claim` with checklist tracking in MongoDB.

---

## 6. Complete REST API Reference

All API routes are prefixed with `/api/v1`.

### 6.1. Authentication Routes (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new claimant account (`name`, `email`, `password`, `phone`, `state`). |
| `POST` | `/login` | Public | Authenticate user; returns JWT token and user profile payload. |
| `POST` | `/forgot-password`| Public | Initiates password reset flow; confirms email registration in database. |
| `POST` | `/reset-password` | Public | Resets user password after OTP verification; clears lockout counters. |
| `GET`  | `/config/emailjs` | Public | Provides client with public EmailJS service, template, and public key from `.env`. |

### 6.2. Case Management Routes (`/api/v1/cases`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Protected | Create a new recovery case. Auto-seeds documents, claims, and assets in MongoDB. |
| `GET` | `/:id` | Protected | Fetch complete case details by MongoDB ObjectId. |
| `GET` | `/:id/dashboard` | Protected | Fetch progress percentages, document counts, and next urgent actions. |
| `POST` | `/:id/documents/generate`| Protected | Generate or fetch the master document checklist for the case. |
| `PUT` | `/documents/:docId/toggle`| Protected | Toggle document collected status (`true` / `false`). |
| `POST` | `/:id/claims/generate` | Protected | Generate statutory claims based on declared asset categories. |
| `GET` | `/:id/claims` | Protected | Fetch all claims associated with the case. |
| `PUT` | `/claims/:claimId` | Protected | Update claim status (`pending`, `in-progress`, `done`). |
| `POST` | `/:id/ai-summary` | Protected | Generate an AI executive case summary via Gemini. |

### 6.3. Asset Management Routes (`/api/v1/assets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Protected | Fetch all assets declared under the active case. |
| `POST` | `/` | Protected | Add a new asset holding with valuation, category, institution, and status. |
| `PUT` | `/:id` | Protected | Update asset details, valuation, or transmission progress. |
| `DELETE`| `/:id` | Protected | Remove an asset holding from the case. |
| `POST` | `/draft-letter` | Protected | Generate a formal AI transmission claim letter for bank/institution. |
| `GET` | `/transfer/:assetType` | Public | Fetch step-by-step transmission guide for property, demat, bank, or locker. |
| `GET` | `/no-nomination` | Public | Fetch Legal Heir vs. Succession Certificate guidance matrix. |
| `GET` | `/minor-protection` | Protected | Check nominee age and return statutory guardianship rules. |
| `GET` | `/liability/:loanType` | Public | Check debt liability and heir recovery exemption rules. |
| `GET` | `/locker-alert` | Public | Calculate 15-day bank locker sealing countdown from death notice date. |

### 6.4. Calculator & Schemes Routes (`/api/v1/calculators`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/benefits` | Public | Calculate Gratuity, Leave Encashment, and Group Insurance benefits. |
| `GET` | `/udgam` | Optional | Search RBI UDGAM registry of 30 banks by exact name or alias. |
| `POST` | `/udgam/predict` | Optional | AI Detective: Predict forgotten accounts based on deceased profile. |
| `POST` | `/udgam/claim-letter` | Optional | Generate formal DEAF claim letter addressed to branch manager. |
| `POST` | `/udgam/claim-to-asset`| Optional | Convert a discovered UDGAM deposit directly into a tracked Asset. |
| `GET` | `/pension/:employerType`| Public | Fetch pension rules by employer type (Central, State, PSU, Defence, EPFO). |
| `POST` | `/pension/calculate` | Public | Calculate monthly family pension and lump sum gratuity. |
| `POST` | `/recommendations` | Optional | Generate SCSS, POMIS, PPF, FD ladder, and AI investment schemes. |
| `GET` | `/pmjjby` | Public | Retrieve PMJJBY / PMSBY insurance claim guidelines. |
| `GET` | `/fd-breaker` | Public | Fetch bank-specific FD premature penalty waiver policies under RBI rules. |

### 6.5. AI Multimodal & RAG Routes (`/api/v1/rag`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ask` | Optional | Ask legal & procedural questions to the Anvaya AI knowledge engine. |
| `POST` | `/analyze-document` | Optional | Multimodal Gemini OCR & entity extraction for uploaded PDFs and images. |
| `GET` | `/search` | Public | Query the internal succession law knowledge base chunks. |
| `GET` | `/status` | Public | Check vector store initialization and Gemini API readiness. |

### 6.6. Reports & Audit Routes (`/api/v1/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/summary/:caseId` | Optional | Fetch comprehensive report audit, valuations, portfolio, and timeline. |
| `GET` | `/summary` | Optional | Fetch report audit for the authenticated user's latest active case. |

### 6.7. Settings & Privacy Routes (`/api/v1/settings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Protected | Fetch authenticated user profile and case metadata. |
| `PUT` | `/profile` | Protected | Update user profile fields (name, phone, state, relationship). |
| `PUT` | `/password` | Protected | Update account password with current password verification. |
| `GET` | `/export` | Protected | Download complete JSON backup of all user cases, documents, and assets. |
| `DELETE`| `/account` | Protected | Permanently delete user account and cascade-delete all related data. |

### 6.8. Statement Discovery Routes (`/api/v1/discovery`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/analyze` | Protected | In-memory bank statement CSV upload (`multipart/form-data`, file field: `statement`, 5MB limit). Returns detected recurring leads, confidence scores, and transaction evidence. |
| `POST` | `/confirm` | Protected | Confirm a discovered lead. Automatically generates an `Asset` (with `source: 'discovered'`) and binds a statutory `Claim` with milestone tracking. |

---

## 7. Database Models & Schema Specifications

### User Schema (`server/models/User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  state: { type: String },
  relationshipToDeceased: { type: String },
  isVerified: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
} // timestamps: true
```

### Case Schema (`server/models/Case.js`)
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  nominee: {
    fullName: { type: String },
    relation: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  deceased: {
    fullName: { type: String },
    dateOfPassing: { type: String },
    hasCertificate: { type: Boolean }
  },
  assetsDeclared: [{
    type: { type: String, enum: ['bank', 'lic', 'epf', 'property', 'postoffice', 'demat', 'fd', 'locker'] },
    hasNomination: { type: Boolean, default: true }
  }],
  hasLocker: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'closed'], default: 'active' }
} // timestamps: true
```

### Document Schema (`server/models/Document.js`)
```javascript
{
  caseId: { type: ObjectId, ref: 'Case', required: true },
  name: { type: String, required: true },
  collected: { type: Boolean, default: false },
  fileUrl: { type: String },
  verifiedAt: { type: Date }
} // timestamps: true
```

### Claim Schema (`server/models/Claim.js`)
```javascript
{
  caseId: { type: ObjectId, ref: 'Case', required: true },
  assetId: { type: ObjectId, ref: 'Asset' },
  claimType: { type: String, enum: ['bank', 'lic', 'epf', 'property', 'postoffice', 'pmjjby', 'pmsby'], required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' },
  deadline: { type: Date },
  filedOn: { type: Date }
} // timestamps: true
```

### Asset Schema (`server/models/Asset.js`)
```javascript
{
  caseId: { type: ObjectId, ref: 'Case', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['bank', 'lic', 'epf', 'property', 'postoffice', 'demat', 'fd', 'locker', 'gold', 'vehicle', 'other'], required: true },
  type: { type: String, default: 'Others' },
  institution: { type: String },
  accountNumber: { type: String },
  approximateValue: { type: Number, default: 0 },
  hasNomination: { type: Boolean, default: true },
  transferStatus: { type: String, enum: ['Not Started', 'In Progress', 'Documents Submitted', 'Under Review', 'Transferred'], default: 'Not Started' },
  docsReq: { type: Number, default: 3 },
  docsSubmitted: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  source: { type: String, enum: ['manual', 'discovered'], default: 'manual' },
  confidence: { type: Number },
  evidence: { type: Array }
} // timestamps: true
```

---

## 8. Mathematical & Statutory Formulas

### 8.1. Gratuity (Payment of Gratuity Act 1972)
$$\text{Gratuity} = \frac{\text{Last Drawn Basic Salary + DA} \times 15 \times \text{Years of Service}}{26}$$
*Statutory Rules Applied:*
- 26 represents working days in a month.
- Service $>6$ months rounded up to the nearest full year.
- Maximum tax-exempt ceiling: **₹20,00,000** (₹20 Lakhs).
- In case of demise in service, gratuity is payable regardless of whether 5 years of continuous service was completed.

### 8.2. Fixed Deposit Compound Interest
$$A = P \left(1 + \frac{r}{n}\right)^{nt}$$
Where:
- $P$ = Principal amount deposited
- $r$ = Annual interest rate (decimal)
- $n$ = Compounding frequency per year (quarterly, $n = 4$ as per Indian banking norm)
- $t$ = Tenor in years

### 8.3. EPFO EPS-95 Monthly Family Pension
$$\text{Normal Pension} = \frac{\text{Pensionable Salary (capped at ₹15,000)} \times \text{Pensionable Service}}{70}$$
*Statutory Widow & Children Allowances:*
- **Widow Pension:** 50% of employee's pension entitlement (minimum ₹1,000/month guaranteed).
- **Children Pension:** 25% of widow pension per child (payable up to 2 children simultaneously until age 25).
- **Orphan Pension:** 75% of widow pension if both parents are deceased.

### 8.4. Central Government Enhanced Family Pension (7th Pay Commission)
$$\text{Enhanced Monthly Pension} = 50\% \times \text{Last Drawn Pay}$$
Payable for a period of **10 years** from the date of demise in service (or until age 67 had the employee survived), after which it transitions to normal family pension at **30% of last drawn pay**.

### 8.5. Case Recovery Progress Weighting
$$\text{Overall Score} = (\text{Doc Completion} \times 0.30) + (\text{Claims Settlement} \times 0.40) + (\text{Asset Transmission} \times 0.30)$$

---

## 9. Installation, Setup & Deployment Guide

### 9.1. Prerequisites
- **Node.js:** v16.14.0 or higher
- **MongoDB:** v5.0+ running locally on port 27017 or a MongoDB Atlas cloud URI
- **Google Gemini API Key:** Required for AI RAG assistant and multimodal document scanner ([Get Key](https://aistudio.google.com/))

### 9.2. Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/SiddharthGoutamKumar/Anvaya.git
   cd Anvaya
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/anvaya
   JWT_SECRET=anvaya_production_secure_jwt_secret_key_2026
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5500
   GEMINI_API_KEY=your_gemini_api_key_here

   # EmailJS Configuration (for real OTP password recovery)
   EMAILJS_SERVICE_ID=your_emailjs_service_id
   EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   EMAILJS_PUBLIC_KEY=your_emailjs_public_key

   # Optional SMTP credentials for legacy email alerts
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_gmail_app_password
   SUPPORT_EMAIL=kumarsiddharth166@gmail.com
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Run the Backend Server:**
   ```bash
   # Development mode with hot-reload (nodemon)
   npm run dev

   # Production mode
   npm start
   ```

5. **Serve the Frontend:**
   The frontend is pure static HTML/CSS/JS. It can be served using any local static server:
   ```bash
   # Option A: Using Python built-in server (from project root)
   python -m http.server 5500

   # Option B: Using Node http-server
   npx http-server client -p 5500

   # Option C: Using VS Code "Live Server" extension on client/pages/login.html
   ```

6. **Access the Application:**
   Open your browser and navigate to:
   ```
   http://localhost:5500/pages/login.html
   ```

---

## 10. Security Architecture & Threat Model

Anvaya was designed with privacy-first principles recognizing the sensitive nature of financial death claims:

1. **Defense-in-Depth Authentication:**
   - Stateless JWT tokens stored strictly in browser `localStorage`.
   - All protected endpoints verify authorization via Bearer headers in `authMiddleware.js`.
   - Account lockout enforcement prevents online dictionary attacks.

2. **NoSQL Injection Prevention:**
   - Input payloads are sanitized through `express-mongo-sanitize` to strip MongoDB operator injection vectors.
   - All Mongoose queries strictly validate `mongoose.Types.ObjectId.isValid()`.

3. **Cross-Site Scripting (XSS) Defense:**
   - Zero `eval()` or unescaped HTML injection.
   - Helmet enforces strict HTTP headers: `X-XSS-Protection`, `X-Content-Type-Options: nosniff`.
   - Strict Content Security Policy (CSP) blocking unauthorized script domains.

4. **Data Minimization & GDPR Erasure:**
   - Claimant accounts can be permanently wiped with a single click in Settings.
   - Cascading deletion permanently removes all associated case records, claims, documents, and assets from MongoDB.

---

## 11. Author & Capstone Credits

- **Author & Architect:** Siddharth Goutam Kumar  
- **Degree:** B.Tech in Information Technology  
- **Capstone Project:** Autonomous Legal & Financial Succession Platform  
- **Support & Feedback:** `kumarsiddharth166@gmail.com`  
- **License:** MIT Open Source License  

*Anvaya transforms the grief-stricken chaos of financial recovery into a structured, deterministic, and compassionate digital journey.*