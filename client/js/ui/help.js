// help.js - ANVAYA Help & Knowledge Hub

document.addEventListener('DOMContentLoaded', () => {
  // Initialize page layout and header
  if (typeof initPage === 'function') {
    initPage('help', {
      greeting: 'Help & Knowledge Hub',
      subtitle: 'Everything you need to know, in one place'
    });
  }

  // --- Category Data with Full Details ---
  const categories = [
    {
      id: 'getting-started',
      iconClass: 'icon-blue',
      badge: 'Getting Started',
      badgeClass: 'badge-blue',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
      title: 'Getting Started',
      desc: 'How to begin your recovery journey step-by-step',
      readTime: '4 min read',
      searchable: 'getting started begin recovery journey first steps timeline checklist',
      content: `
        <div class="guide-prose">
          <h4>Your Immediate Action Plan</h4>
          <p>Navigating financial recovery after losing a loved one can feel overwhelming. Following a structured roadmap ensures you never miss a deadline or critical document.</p>
          
          <div class="guide-callout alert-success">
            <strong>First 21 Days:</strong> Your highest priority is registering the death with municipal authorities and securing 10+ certified original copies of the Death Certificate.
          </div>

          <ul class="guide-steps-timeline">
            <li class="guide-step-item">
              <div class="guide-step-num">1</div>
              <div class="guide-step-text">
                <strong>Obtain Key Certificates:</strong> Death Certificate, Doctor/Hospital Cause-of-Death summary, and identity proofs (Aadhaar, PAN) of the deceased and family members.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">2</div>
              <div class="guide-step-text">
                <strong>Discover & List Assets:</strong> Check bank SMS, income tax returns (Form 26AS), lockers, and search the RBI UDGAM portal for unclaimed accounts.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">3</div>
              <div class="guide-step-text">
                <strong>Notify Insurers & Employers:</strong> File early intimations for Life Insurance (LIC/Private), EPF/Pension (Form 10D), and Gratuity.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">4</div>
              <div class="guide-step-text">
                <strong>Process Bank Accounts:</strong> Submit nominee claim forms (DA-1/DA-2) with banks for fast 15-day settlement.
              </div>
            </li>
          </ul>

          <div class="quick-action-strip">
            <a href="Onboarding.html" class="quick-action-link">Start Guided Onboarding →</a>
            <a href="documents.html" class="quick-action-link">Open Document Checklist →</a>
          </div>
        </div>
      `
    },
    {
      id: 'documents-guide',
      iconClass: 'icon-navy',
      badge: 'Documents',
      badgeClass: 'badge-navy',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      title: 'Documents Guide',
      desc: 'Which documents you need, issuing authorities & checklists',
      readTime: '6 min read',
      searchable: 'documents guide death certificate legal heir succession aadhaar pan passbook',
      content: `
        <div class="guide-prose">
          <h4>Essential Documents Checklist</h4>
          <p>Every bank, insurer, and government body will request a specific set of verified documents. Keep multiple photocopies and digitized scans ready.</p>

          <div class="checklist-box">
            <strong>Mandatory Core Documents:</strong>
            <ul>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Death Certificate:</strong> Original + 10 certified copies from Municipal Corporation/Gram Panchayat.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Deceased KYC:</strong> Original PAN card, Aadhaar card, Voter ID, and Passport (if available).</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Claimant / Nominee KYC:</strong> Aadhaar, PAN card, address proof, and active bank account cancelled cheque.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Relationship Proof:</strong> Birth certificate, marriage certificate, or ration card showing claimant relationship.</span>
              </li>
            </ul>
          </div>

          <div class="guide-callout">
            <strong>Pro Tip:</strong> When submitting physical copies to banks, always carry the original Death Certificate for in-person verification ("Original Seen & Verified").
          </div>

          <div class="quick-action-strip">
            <a href="documents.html" class="quick-action-link">View Full Interactive Checklist →</a>
          </div>
        </div>
      `
    },
    {
      id: 'claims-guide',
      iconClass: 'icon-green',
      badge: 'Claims',
      badgeClass: 'badge-green',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>`,
      title: 'Claims Guide',
      desc: 'Step-by-step claim filing process and timelines',
      readTime: '7 min read',
      searchable: 'claims guide bank insurance epf process settlement timeline nominee',
      content: `
        <div class="guide-prose">
          <h4>How to File and Track Claims Efficiently</h4>
          <p>Claims generally fall into four categories: Bank Deposits, Insurance Policies, Employer Retirement Benefits (EPF/Gratuity), and Post Office/Small Savings.</p>

          <ul class="guide-steps-timeline">
            <li class="guide-step-item">
              <div class="guide-step-num">1</div>
              <div class="guide-step-text">
                <strong>Intimation:</strong> Contact the branch or portal with policy/account numbers. Request the official Deceased Claim Kit.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">2</div>
              <div class="guide-step-text">
                <strong>Submission & Acknowledgment:</strong> Submit the filled claim form, KYC, and cancelled cheque. Always collect a written stamped acknowledgment receipt with a claim reference number.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">3</div>
              <div class="guide-step-text">
                <strong>Mandated Settlement:</strong> Per RBI circulars, nominated bank claims must be settled within <strong>15 days</strong> of complete document submission.
              </div>
            </li>
          </ul>

          <div class="guide-callout alert-warning">
            <strong>Delay Protection:</strong> If a bank or insurer delays settlement beyond statutory limits without valid reason, you are entitled to penal interest per RBI/IRDAI guidelines.
          </div>

          <div class="quick-action-strip">
            <a href="claims.html" class="quick-action-link">Open Claim Tracker →</a>
            <a href="calculator.html" class="quick-action-link">Calculate Benefits →</a>
          </div>
        </div>
      `
    },
    {
      id: 'legal-process',
      iconClass: 'icon-purple',
      badge: 'Legal',
      badgeClass: 'badge-navy',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`,
      title: 'Legal Process',
      desc: 'Succession, nomination, court procedures and inheritance laws',
      readTime: '8 min read',
      searchable: 'legal process succession certificate legal heir will nomination court lawyer',
      content: `
        <div class="guide-prose">
          <h4>Legal Rights & Succession Explained</h4>
          <p>Understanding the distinction between nominees and legal heirs avoids family disputes and legal gridlocks.</p>

          <div class="guide-callout">
            <strong>Supreme Court Rule:</strong> A nominee is a legal custodian/trustee responsible for receiving the asset from the bank, but the asset legally belongs to the Class-I legal heirs according to applicable succession law.
          </div>

          <h4>When is a Court Certificate Required?</h4>
          <ul class="guide-steps-timeline">
            <li class="guide-step-item">
              <div class="guide-step-num">A</div>
              <div class="guide-step-text">
                <strong>Legal Heir Certificate:</strong> Issued by the Tehsildar / Sub-Divisional Magistrate (SDM) in 15-30 days. Used for family pension, compassionate appointment, and government dues.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">B</div>
              <div class="guide-step-text">
                <strong>Succession Certificate:</strong> Issued by the Civil Court under the Indian Succession Act for debts, securities, shares, and bank accounts without nomination. Takes 6-12 months.
              </div>
            </li>
          </ul>

          <div class="quick-action-strip">
            <a href="nomination.html" class="quick-action-link">No Nomination Path Guide →</a>
          </div>
        </div>
      `
    },
    {
      id: 'government-schemes',
      iconClass: 'icon-gold',
      badge: 'Government',
      badgeClass: 'badge-green',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"></line><line x1="3" y1="10" x2="21" y2="10"></line><polyline points="5 6 12 3 19 6"></polyline><line x1="4" y1="10" x2="4" y2="21"></line><line x1="20" y1="10" x2="20" y2="21"></line><line x1="8" y1="14" x2="8" y2="17"></line><line x1="12" y1="14" x2="12" y2="17"></line><line x1="16" y1="14" x2="16" y2="17"></line></svg>`,
      title: 'Government Schemes',
      desc: 'PMJJBY, PMSBY, UDGAM, EPF, EPS-95 and post office benefits',
      readTime: '6 min read',
      searchable: 'government schemes pmjjby pmsby udgam epf pension post office provident fund',
      content: `
        <div class="guide-prose">
          <h4>Overlooked Government Welfare Entitlements</h4>
          <p>Many Indian citizens are automatically enrolled in subsidized schemes through their bank accounts or formal employment. Make sure you check these:</p>

          <div class="checklist-box">
            <strong>Key Schemes to Check:</strong>
            <ul>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>PMJJBY (Pradhan Mantri Jeevan Jyoti Bima Yojana):</strong> ₹2,00,000 life insurance (bank premium ₹436/year).</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>EDLI (Employees Deposit Linked Insurance):</strong> Up to ₹7,00,000 life cover automatically provided to active EPF members.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>EPS-95 Widow & Children Pension:</strong> Monthly pension to surviving spouse and up to 2 children below age 25.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>RBI UDGAM Portal:</strong> Search across 30+ major banks for dormant/unclaimed deposits.</span>
              </li>
            </ul>
          </div>

          <div class="quick-action-strip">
            <a href="pension.html" class="quick-action-link">Explore Pension & Schemes →</a>
            <a href="udgam.html" class="quick-action-link">Launch UDGAM Checker →</a>
          </div>
        </div>
      `
    },
    {
      id: 'safety-fraud',
      iconClass: 'icon-crimson',
      badge: 'Safety',
      badgeClass: 'badge-blue',
      icon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
      title: 'Safety & Fraud Protection',
      desc: 'Avoid middlemen, prevent scams, and secure your claims',
      readTime: '5 min read',
      searchable: 'safety fraud protection avoid middlemen scams cyber crime security',
      content: `
        <div class="guide-prose">
          <h4>Protecting Your Family from Exploitation & Scams</h4>
          <p>Families undergoing grief are unfortunately targeted by fraudulent intermediaries claiming to "expedite" death claims for a hefty commission.</p>

          <div class="guide-callout alert-warning">
            <strong>Golden Rule:</strong> Banks, LIC, and the EPFO DO NOT charge any fee for nominee claim settlements. Never pay anyone to release your family's lawful funds.
          </div>

          <div class="checklist-box">
            <strong>Essential Safety Protocols:</strong>
            <ul>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Never hand over original documents without receiving a signed and stamped branch acknowledgment.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Never share Aadhaar OTPs, banking PINs, or net banking passwords with third-party callers.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>If a broker demands commission, immediately report to the National Consumer Helpline at <strong>1915</strong> or Banking Ombudsman at <strong>14448</strong>.</span>
              </li>
            </ul>
          </div>

          <div class="quick-action-strip">
            <a href="mailto:kumarsiddharth166@gmail.com" class="quick-action-link">Report an Issue to Support →</a>
          </div>
        </div>
      `
    }
  ];

  // --- Popular Guides Data with Full Step Articles ---
  const guides = [
    {
      id: 'death-cert-guide',
      title: 'How to obtain a Death Certificate',
      readTime: '5 min read',
      badge: 'Documents',
      badgeClass: 'badge-blue',
      content: `
        <div class="guide-prose">
          <h4>Step-by-Step Registration & Issuance</h4>
          <p>The Death Certificate is the foundational document required for every single claim, asset transfer, and bank settlement.</p>

          <div class="guide-callout alert-success">
            <strong>Registration Window:</strong> Deaths should be reported within <strong>21 days</strong> to the local Registrar (Municipal Corporation in cities, Gram Panchayat in villages). Within 21 days, issuance is free of cost.
          </div>

          <h4>Where to Apply:</h4>
          <ul>
            <li><strong>Urban Areas:</strong> Municipal Corporation / Municipality / Nagar Nigam health department.</li>
            <li><strong>Rural Areas:</strong> Gram Panchayat office / Village Administrative Officer (VAO).</li>
            <li><strong>Online:</strong> Central Civil Registration System portal (<a href="https://crsorgi.gov.in" target="_blank" rel="noopener">crsorgi.gov.in</a>) or respective State Citizen Service Portals (e.g., e-District, Seva Kendra).</li>
          </ul>

          <h4>Required Documents:</h4>
          <ul>
            <li>Hospital Death Report / Form 4 (Institutional death) or Doctor's certificate Form 4A (Home death).</li>
            <li>Identity proof of the deceased (Aadhaar, PAN, Voter ID).</li>
            <li>Identity proof of the informant / applicant.</li>
            <li>Address proof where death occurred.</li>
          </ul>

          <div class="guide-callout">
            <strong>Tip:</strong> Always request at least <strong>10 to 15 certified copies</strong> during your first application. Many institutions retain physical copies.
          </div>
        </div>
      `
    },
    {
      id: 'bank-claim-guide',
      title: 'How to file a bank claim as a nominee',
      readTime: '7 min read',
      badge: 'Banking',
      badgeClass: 'badge-navy',
      content: `
        <div class="guide-prose">
          <h4>Bank Deceased Claim Settlement Process</h4>
          <p>If the deceased person registered a nominee on their savings account, fixed deposit, or recurring deposit, the settlement is fast and legally straightforward.</p>

          <ul class="guide-steps-timeline">
            <li class="guide-step-item">
              <div class="guide-step-num">1</div>
              <div class="guide-step-text">
                <strong>Collect Deceased Claim Application (Form DA-2):</strong> Available at the home branch or downloadable on the bank's official website.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">2</div>
              <div class="guide-step-text">
                <strong>Assemble Attachments:</strong> Original Death Certificate (for verification), passbook / FDR receipt, nominee KYC documents (Aadhaar, PAN), and nominee cancelled cheque.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">3</div>
              <div class="guide-step-text">
                <strong>Branch Submission:</strong> Present documents in person. The branch manager will stamp "Original Seen & Verified" on photocopies and return your original Death Certificate.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">4</div>
              <div class="guide-step-text">
                <strong>Disbursement:</strong> Funds are transferred directly to the nominee's verified bank account via NEFT/RTGS within 15 calendar days.
              </div>
            </li>
          </ul>

          <div class="guide-callout alert-success">
            <strong>RBI Mandate:</strong> Per RBI Master Circular DBOD.No.Leg.BC.95/09.07.005/2004-05, banks must settle nominee claims within <strong>15 days</strong> of complete paperwork.
          </div>
        </div>
      `
    },
    {
      id: 'succession-guide',
      title: 'Understanding Legal Heir Certificate vs Succession Certificate',
      readTime: '10 min read',
      badge: 'Legal',
      badgeClass: 'badge-navy',
      content: `
        <div class="guide-prose">
          <h4>Key Differences at a Glance</h4>
          <p>Families often confuse these two certificates. Using the wrong one can lead to rejected applications and lost months.</p>

          <div class="checklist-box">
            <ul>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Issuing Authority:</strong> Legal Heir Certificate is issued by the Revenue Authority (Tehsildar/SDM). Succession Certificate is issued only by a Civil Court Judge.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Scope:</strong> Legal Heir Certificate identifies surviving family members for government pensions, employment transfer, and utility connection name changes. Succession Certificate specifically authorises transfer of securities, debts, shares, and bank balances without nomination.</span>
              </li>
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span><strong>Time & Cost:</strong> Legal Heir Certificate takes 15–30 days with minimal nominal fees. Succession Certificate takes 6–12 months with court fee stamps (approx 2–3% of asset value depending on state).</span>
              </li>
            </ul>
          </div>
        </div>
      `
    },
    {
      id: 'epf-withdrawal-guide',
      title: 'EPF withdrawal process for nominees',
      readTime: '6 min read',
      badge: 'Gov',
      badgeClass: 'badge-green',
      content: `
        <div class="guide-prose">
          <h4>EPF, EPS Pension & EDLI Insurance Claims</h4>
          <p>Nominees of salaried employees are eligible for three separate benefits under the EPFO:</p>

          <ul class="guide-steps-timeline">
            <li class="guide-step-item">
              <div class="guide-step-num">1</div>
              <div class="guide-step-text">
                <strong>Form 20 (PF Accumulation):</strong> Withdraws the accumulated employee + employer Provident Fund balance with interest.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">2</div>
              <div class="guide-step-text">
                <strong>Form 10D (Monthly Pension):</strong> Provides monthly survivor pension to the widow/widower for life, and to children up to age 25.
              </div>
            </li>
            <li class="guide-step-item">
              <div class="guide-step-num">3</div>
              <div class="guide-step-text">
                <strong>Form 5IF (EDLI Insurance):</strong> Automatically provides up to <strong>₹7,00,000</strong> life insurance payout if the employee passed away while in active service.
              </div>
            </li>
          </ul>

          <div class="guide-callout alert-success">
            <strong>Online Submission:</strong> If e-Nomination was filed by the member on the Unified Portal, nominees can file completely online. Otherwise, submit physical composite claim forms through the employer's HR or directly to the regional EPFO office.
          </div>
        </div>
      `
    },
    {
      id: 'lic-claim-guide',
      title: 'How to claim LIC policy after death',
      readTime: '8 min read',
      badge: 'Insurance',
      badgeClass: 'badge-blue',
      content: `
        <div class="guide-prose">
          <h4>Life Insurance Claim Roadmap (LIC & Private)</h4>
          <p>Life insurance claims require timely intimation and submission of policy claim forms.</p>

          <h4>Key Claim Forms:</h4>
          <ul>
            <li><strong>Form No. 3783 (Claim Form 'A'):</strong> Statement of the claimant detailing cause of death and nominee bank details.</li>
            <li><strong>Form No. 3784 (Form 'B'):</strong> Medical Attendant certificate completed by the doctor who treated the deceased during their last illness.</li>
            <li><strong>Form No. 3801 (Form 'C'):</strong> Certificate of identity and burial/cremation.</li>
          </ul>

          <h4>Early vs Non-Early Claims:</h4>
          <p>If death occurs after 3 years of policy inception (Non-Early Claim), settlement is expedited with minimal inquiry. Claims within 3 years may require hospital treatment records.</p>
        </div>
      `
    },
    {
      id: 'locker-guide',
      title: 'Preventing bank locker seizure',
      readTime: '4 min read',
      badge: 'Banking',
      badgeClass: 'badge-navy',
      content: `
        <div class="guide-prose">
          <h4>Accessing and Operating Deceased Lockers</h4>
          <p>Bank lockers require strict adherence to RBI inventory guidelines before release of contents.</p>

          <h4>Scenarios:</h4>
          <ul>
            <li><strong>Locker with Nominee:</strong> Nominee has the right to access and remove locker contents. The bank will open the locker in the presence of the nominee and two independent witnesses, create an inventory list, and hand over contents without requiring a court succession certificate.</li>
            <li><strong>Joint Locker ("Either or Survivor"):</strong> Surviving locker holder has full independent operational rights.</li>
            <li><strong>Locker without Nominee:</strong> Requires all legal heirs to execute a joint claim with indemnity or obtain a court succession certificate / probate.</li>
          </ul>
        </div>
      `
    }
  ];

  // --- Helplines Data ---
  const helplines = [
    { name: 'EPFO Toll-Free Helpline', number: '1800-118-005', type: 'phone' },
    { name: 'LIC Customer Care', number: '1800-258-4477', type: 'phone' },
    { name: 'IRDAI Insurance Ombudsman', number: '155255', type: 'phone' },
    { name: 'National Consumer Helpline', number: '1915', type: 'phone' },
    { name: 'RBI Banking Ombudsman', number: '14448', type: 'phone' },
    { name: 'NALSA Free Legal Aid', number: '15100', type: 'phone' },
    { name: 'Anvaya Official Support', number: 'kumarsiddharth166@gmail.com', type: 'email' }
  ];

  // --- FAQs Data ---
  const faqs = [
    { 
      q: 'What is the first thing I should do after losing a family member?', 
      a: 'Focus on obtaining the death certificate as early as possible within the 21-day window. Most institutions will require at least 5-10 certified copies to begin any claims or asset transfer process.' 
    },
    { 
      q: 'How long do I have to file insurance and bank claims?', 
      a: 'Most insurance companies prefer claims to be filed within 30-90 days, but delays are accepted if valid reasons (grief, obtaining certificates) are provided. Banks have no strict expiration date for nominee claims, but early filing prevents accounts from slipping into dormant status.' 
    },
    { 
      q: 'What if the deceased person left no Will (died intestate)?', 
      a: 'If there is no will, assets are distributed according to personal succession laws (e.g. Hindu Succession Act, Indian Succession Act). All Class-I legal heirs (surviving spouse, children, mother) have equal shares. A Legal Heir or Succession Certificate will be required.' 
    },
    { 
      q: 'How can I discover all unknown bank accounts and investments?', 
      a: '1. Use the RBI UDGAM portal to search across 30+ major banks.\n2. Download the deceased person\'s AIS / Form 26AS from the Income Tax e-Filing portal to see interest income and dividend records.\n3. Check SMS, emails, and physical passbooks.' 
    },
    { 
      q: 'Can a bank charge processing fees to settle a nominee claim?', 
      a: 'No. Under RBI guidelines, banks are strictly prohibited from levying any processing charges or fees for settling deceased depositor accounts with registered nominees.' 
    },
    { 
      q: 'What is the maximum life cover under the EPF EDLI scheme?', 
      a: 'The Employees Deposit Linked Insurance (EDLI) scheme provides a tax-free payout of up to ₹7,00,000 to the registered nominee of an active EPF member, with a minimum guaranteed payout of ₹2,50,000.' 
    },
    { 
      q: 'How long does the entire recovery process typically take?', 
      a: 'Simple nominated bank accounts and PF claims take 15 to 30 days. Complex cases involving disputed properties or civil court succession certificates can take 6 to 12 months.' 
    }
  ];

  // --- DOM Elements ---
  const categoriesGrid = document.getElementById('categories-grid');
  const guidesList = document.getElementById('guides-list');
  const helplinesList = document.getElementById('helplines-list');
  const faqAccordion = document.getElementById('faq-accordion');
  const searchInput = document.getElementById('help-search');

  // Modal Elements
  const helpModal = document.getElementById('helpModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBadgeWrapper = document.getElementById('modalBadgeWrapper');
  const modalMeta = document.getElementById('modalMeta');
  const modalBody = document.getElementById('modalBody');
  const closeHelpModal = document.getElementById('closeHelpModal');
  const modalDoneBtn = document.getElementById('modalDoneBtn');

  // --- Modal Open & Close Logic ---
  function openReaderModal({ title, badge, badgeClass, readTime, content }) {
    if (!helpModal) return;
    modalTitle.textContent = title;
    modalBadgeWrapper.innerHTML = badge ? `<span class="badge ${badgeClass || 'badge-blue'}">${badge}</span>` : '';
    modalMeta.textContent = readTime ? `⏱️ ${readTime} • Comprehensive Guide` : 'Knowledge Hub Article';
    modalBody.innerHTML = content;
    helpModal.classList.add('active');
    helpModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!helpModal) return;
    helpModal.classList.remove('active');
    helpModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeHelpModal) closeHelpModal.addEventListener('click', closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);

  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal && helpModal.classList.contains('active')) {
      closeModal();
    }
  });

  // --- Render Functions ---
  function renderCategories(data) {
    if (!categoriesGrid) return;
    if (data.length === 0) {
      categoriesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 32px; background: #fff; border-radius: 12px; border: 1px dashed var(--border-light);">
          <p style="color: var(--text-muted); margin-bottom: 12px;">No matching categories found for your search.</p>
          <a href="chat.html" class="btn btn-primary" style="display:inline-block; font-size:0.875rem;">Ask Anvaya AI instead →</a>
        </div>
      `;
      return;
    }

    categoriesGrid.innerHTML = data.map((cat, idx) => `
      <div class="category-card" data-cat-id="${cat.id}">
        <div class="category-icon ${cat.iconClass}">${cat.icon}</div>
        <h3 class="category-title">${cat.title}</h3>
        <p class="category-desc">${cat.desc}</p>
        <span class="category-link">Read More →</span>
      </div>
    `).join('');

    // Attach click listeners to entire category card
    categoriesGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-cat-id');
        const found = categories.find(c => c.id === catId);
        if (found) {
          openReaderModal({
            title: found.title,
            badge: found.badge,
            badgeClass: found.badgeClass,
            readTime: found.readTime,
            content: found.content
          });
        }
      });
    });
  }

  function renderGuides(data = guides) {
    if (!guidesList) return;
    if (data.length === 0) {
      guidesList.innerHTML = `<div style="padding: 16px; color: var(--text-muted); text-align: center;">No matching guides found.</div>`;
      return;
    }

    guidesList.innerHTML = data.map(guide => `
      <div class="guide-item" data-guide-id="${guide.id}">
        <div class="guide-info">
          <span class="guide-title">${guide.title}</span>
          <div class="guide-meta">
            <span>⏱️ ${guide.readTime}</span>
            <span class="badge ${guide.badgeClass}">${guide.badge}</span>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted)"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    `).join('');

    guidesList.querySelectorAll('.guide-item').forEach(item => {
      item.addEventListener('click', () => {
        const guideId = item.getAttribute('data-guide-id');
        const found = guides.find(g => g.id === guideId);
        if (found) {
          openReaderModal({
            title: found.title,
            badge: found.badge,
            badgeClass: found.badgeClass,
            readTime: found.readTime,
            content: found.content
          });
        }
      });
    });
  }

  function renderHelplines() {
    if (!helplinesList) return;
    helplinesList.innerHTML = helplines.map(line => `
      <div class="helpline-item">
        <div>
          <div class="helpline-name">${line.name}</div>
          <div class="helpline-number">${line.number}</div>
        </div>
        <button class="copy-btn" data-copy="${line.number}" aria-label="Copy ${line.name}" title="Copy to clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
    `).join('');

    helplinesList.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const textToCopy = btn.getAttribute('data-copy');
        copyText(textToCopy, btn);
      });
    });
  }

  function renderFAQs(data) {
    if (!faqAccordion) return;
    if (data.length === 0) {
      faqAccordion.innerHTML = `<div style="padding: 16px; color: var(--text-muted); text-align: center;">No matching FAQs found.</div>`;
      return;
    }

    faqAccordion.innerHTML = data.map((faq, index) => `
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          <span>${faq.q}</span>
          <svg class="faq-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="faq-answer">
          <p>${faq.a.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `).join('');

    faqAccordion.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleFAQ(btn);
      });
    });
  }

  // --- Initial Render ---
  renderCategories(categories);
  renderGuides();
  renderHelplines();
  renderFAQs(faqs);

  // --- FAQ Accordion Toggle ---
  function toggleFAQ(btn) {
    const item = btn.parentElement;
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    
    // Close all other FAQs
    faqAccordion.querySelectorAll('.faq-item').forEach(faq => {
      faq.classList.remove('active');
      const qBtn = faq.querySelector('.faq-question');
      if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
    });

    // Toggle selected FAQ
    if (!isExpanded) {
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  // --- Copy Helper with Visual Feedback ---
  function copyText(text, btnElement) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast(`Copied "${text}" to clipboard!`, 'success');
      }
      if (btnElement) {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
          btnElement.innerHTML = originalHTML;
        }, 1800);
      }
    }).catch(err => {
      console.error('Failed to copy text:', err);
      if (typeof showToast === 'function') {
        showToast('Failed to copy to clipboard', 'error');
      }
    });
  }

  // --- Live Search ---
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim().toLowerCase();
      
      searchTimeout = setTimeout(() => {
        if (!query) {
          renderCategories(categories);
          renderGuides(guides);
          renderFAQs(faqs);
          return;
        }

        // Filter Categories
        const filteredCategories = categories.filter(c => 
          c.title.toLowerCase().includes(query) || 
          c.desc.toLowerCase().includes(query) || 
          c.searchable.includes(query)
        );
        renderCategories(filteredCategories);

        // Filter Guides
        const filteredGuides = guides.filter(g =>
          g.title.toLowerCase().includes(query) ||
          g.badge.toLowerCase().includes(query)
        );
        renderGuides(filteredGuides);

        // Filter FAQs
        const filteredFaqs = faqs.filter(f => 
          f.q.toLowerCase().includes(query) || 
          f.a.toLowerCase().includes(query)
        );
        renderFAQs(filteredFaqs);
        
      }, 250);
    });
  }
});
