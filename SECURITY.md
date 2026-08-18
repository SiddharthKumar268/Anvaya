# Security Architecture & Threat Model — Anvaya

Anvaya operates in a high-sensitivity domain, handling personally identifiable information (PII) including PAN cards, Aadhaar numbers, bank account details, insurance policy numbers, and death certificates. Security is treated as a fundamental architectural pillar, not a supplementary feature.

This document outlines the comprehensive security model, implemented mitigations against critical threat vectors, and the strategic rationale behind data protection in the Anvaya platform.

---

## 1. Core Security Model & Principles

Anvaya's security architecture is built on three foundational principles:
- **Defense in Depth:** Multiple layers of security controls at the network, application, and data layers to ensure that the failure of one control does not compromise the entire system.
- **Least Privilege:** Users, processes, and systems are granted only the minimum access necessary to perform their legitimate functions.
- **Data Minimization & Sanitization:** Only essential data is collected, and all data entering the system is strictly sanitized and validated before processing.

---

## 2. Threat Vectors & Implemented Mitigations

The following critical vulnerabilities have been proactively mitigated in the current MVP infrastructure:

### A. Authentication & Session Management
- **Brute-Force Attacks:** Mitigated using `express-rate-limit`. Strict rate limiters are applied specifically to `/auth/*` endpoints (e.g., maximum 5 requests per 15 minutes per IP) to prevent credential stuffing and brute-force password guessing.
- **Account Lockout Mechanism:** Implemented in `User.js` and `authController.js`. If a user fails to authenticate 5 consecutive times, the account is cryptographically locked for 15 minutes (`failedLoginAttempts` / `lockUntil`), neutralizing automated password cracking attempts.
- **Credential Harvesting:** Passwords are never stored in plaintext. Anvaya utilizes `bcryptjs` with a high computational cost (salt rounds ≥ 10). The password field is explicitly excluded from default database queries (`select: false` in Mongoose schema) to prevent accidental exposure via APIs.
- **Session Hijacking:** Stateless authentication using JSON Web Tokens (JWT). Tokens are signed with a strong, high-entropy secret (`JWT_SECRET`) and possess a strict expiration (`JWT_EXPIRE`).

### B. Injection & Data Integrity
- **NoSQL Injection:** Mitigated via `express-mongo-sanitize`. All incoming request payloads (body, query, params) are recursively stripped of keys containing prohibited characters (e.g., `$`, `.`) before reaching the database execution layer.
- **Cross-Site Scripting (XSS):** Addressed using `xss-clean`. User input is actively sanitized to remove malicious HTML/JavaScript payloads, preventing persistent and reflected XSS attacks.

### C. Infrastructure & Network Security
- **HTTP Header Hardening:** `helmet` is deployed to secure Express applications by setting various HTTP headers.
- **Content Security Policy (CSP):** Explicit Helmet CSP directives (`default-src 'self'`) are enforced. External scripts and connections are strictly whitelisted (e.g., `https://cdn.jsdelivr.net`, `https://api.emailjs.com`). `object-src 'none'` and `frame-ancestors 'none'` prevent clickjacking and malicious object embedding.
- **Cross-Origin Resource Policy (CORP):** Set to `same-site` via Helmet to protect against cross-origin data leaks and side-channel attacks.

### D. Authorization & Access Control
- **Insecure Direct Object References (IDOR):** Every API route handling cases, claims, documents, and assets inherently enforces ownership checks. The `authMiddleware` injects the verified `req.user._id`, and the subsequent controller explicitly queries the database to ensure the requested resource belongs to that specific user ID.

### E. File System & Asset Security
- **Malicious File Execution:** File uploads (e.g., death certificates) are handled by `Multer`. Strict whitelisting is applied:
  - **MIME-Type Validation:** Only specific file types (PDF, JPG, PNG) are accepted.
  - **Size Limitations:** Maximum file size limits (e.g., 5MB) are enforced to prevent Denial of Service (DoS) via disk exhaustion.

---

## 3. Partially Integrated Controls (Built, Not Wired)

| Control | Mitigation Strategy | Current Status / Integration Requirement |
|---------|---------------------|----------------------------------------|
| **Data Masking** | `utils/maskSensitiveData.js` masks all but the last 4 digits of highly sensitive strings (PAN, Aadhaar, Account Numbers). | Code exists but requires manual integration into `caseController.js` and `assetController.js` formatting logic prior to API response dispatch. |

---

## 4. Future Scope: Production-Grade Enhancements

While the MVP possesses a robust defensive posture, scaling to a production environment handling real financial data requires the implementation of these advanced controls:

1. **Cryptographic Data at Rest:** Implementation of field-level encryption for PAN, Aadhaar, and Bank Account numbers using AES-256-GCM before writing to MongoDB.
2. **Advanced Input Validation:** Replacement of basic sanitization with strict schema validation using `Joi` or `Zod` to ensure structural and type integrity of all incoming payloads.
3. **Enhanced Session Architecture:** Migration from single long-lived JWTs to a short-lived Access Token + HttpOnly Secure Refresh Token pattern.
4. **Token Revocation:** Implementation of a Redis-backed token blacklist to handle immediate session termination upon logout or security breach.
5. **Comprehensive Audit Logging:** Immutable logging of all read/write actions on sensitive case files to track "Who accessed what, and when."
6. **Multi-Factor Authentication (MFA):** Implementation of Time-based One-Time Passwords (TOTP) or SMS-based OTP for login and high-risk actions (e.g., initiating an asset transfer).
7. **Active Malware Scanning:** Integration of ClamAV or a cloud-based scanning service to inspect uploaded documents beyond simple MIME-type checks.
8. **Automated Vulnerability Scanning:** Integration of `npm audit` and static application security testing (SAST) tools into the CI/CD pipeline.

---

## 5. Security Design Rationale

The implemented security measures focus on addressing the highest-probability and highest-impact vectors for a Node.js/Express application dealing with sensitive financial data. The architecture deliberately avoids over-engineering (e.g., avoiding field-level encryption for the MVP) to maintain development velocity, while establishing an impenetrable baseline against common web vulnerabilities (OWASP Top 10) such as injection, XSS, and broken access control.