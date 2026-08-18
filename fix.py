import os

replacements = {
    # HTML Files
    r'client\pages\login.html': [
        ('Your data is safe and encrypted 🔒', 'Your data is safe and encrypted <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>')
    ],
    r'client\pages\calculator.html': [
        ('Benefit Calculator — Anvaya', 'Benefit Calculator - Anvaya')
    ],
    r'client\pages\assets.html': [
        ('Asset Transfer — Anvaya', 'Asset Transfer - Anvaya'),
        ('💰', 'INR'),
        ('✅', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'),
        ('🔄', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>'),
        ('➕', '+')
    ],
    r'client\pages\nomination.html': [
        ('No Nomination Path — Anvaya', 'No Nomination Path - Anvaya'),
        ('📍 No Nomination?', 'No Nomination?'),
        ('💰 Approximate Cost', 'Approximate Cost'),
        ('⚠️ Common Pitfalls', 'Common Pitfalls')
    ],
    r'client\pages\pension.html': [
        ('Pension & Employer Benefits — Anvaya', 'Pension & Employer Benefits - Anvaya'),
        ('💼', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>'),
        ('📈', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'),
        ('🛡️', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'),
        ('🎁', 'Gift'),
        ('🌴', 'Leave'),
        ('💵', 'INR')
    ],
    r'client\pages\udgam.html': [
        ('UDGAM Unclaimed Deposit Checker — Anvaya', 'UDGAM Unclaimed Deposit Checker - Anvaya'),
        ('UDGAM Unclaimed Deposit Checker 🔍', 'UDGAM Unclaimed Deposit Checker <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'),
        ('💡', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>')
    ],
    r'client\pages\reports.html': [
        ('Reports & Progress — Anvaya', 'Reports & Progress - Anvaya')
    ],
    r'client\pages\help.html': [
        ('Help & Knowledge Hub — Anvaya', 'Help & Knowledge Hub - Anvaya'),
        ('Help & Knowledge Hub ❓', 'Help & Knowledge Hub')
    ],
    r'client\pages\settings.html': [
        ('Settings — Anvaya', 'Settings - Anvaya')
    ],
    r'client\pages\dashboard.html': [
        ('Dashboard — Anvaya', 'Dashboard - Anvaya')
    ],
    r'client\pages\claims.html': [
        ('Claim Tracker — Anvaya', 'Claim Tracker - Anvaya'),
        ('📋', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>'),
        ('🟡 ', 'Pending: '),
        ('🔵 ', 'In Progress: '),
        ('🟢 ', 'Completed: '),
        ('🔄', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>'),
        ('✅', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>')
    ],
    r'client\pages\documents.html': [
        ('Document Checklist — Anvaya', 'Document Checklist - Anvaya'),
        ('📋', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>'),
        ('✓', '(Done)')
    ],
    
    # JS Files
    r'client\js\ui\dashboard.js': [
        ('// ANVAYA — Dashboard Page Logic', '// ANVAYA - Dashboard Page Logic'),
        ("greeting: 'Namaste! 👋',", "greeting: 'Namaste!',"),
        ('subtitle: "We\'re with you in every step of this journey. 🤍",', 'subtitle: "We\'re with you in every step of this journey.",')
    ],
    r'client\js\ui\calculator.js': [
        ("greeting: 'Benefit Calculator 🧮',", "greeting: 'Benefit Calculator',")
    ],
    r'client\js\ui\assets.js': [
        ("icon: '🏦',", "icon: 'bank',"),
        ("icon: '📋',", "icon: 'clipboard',"),
        ("icon: '🏠',", "icon: 'house',"),
        ("icon: '💰',", "icon: 'money',"),
        ("icon: '📈',", "icon: 'chart',"),
        ("icon: '🪙',", "icon: 'coin',"),
        ("icon: '📜',", "icon: 'document',"),
        ("icon: '🚗',", "icon: 'car',"),
        ("greeting: 'Asset Transfer 🔄',", "greeting: 'Asset Transfer',"),
        ("📄 ${asset.docsSubmitted}/${asset.docsReq} Documents", "Docs: ${asset.docsSubmitted}/${asset.docsReq}")
    ],
    r'client\js\ui\reports.js': [
        ("greeting: 'Reports & Progress 📊',", "greeting: 'Reports & Progress',"),
        ("content: 'SBI account transferred <span>✅</span>',", "content: 'SBI account transferred (Done)',")
    ],
    r'client\js\ui\help.js': [
        ("icon: '🚀',", "icon: 'rocket',"),
        ("icon: '📄',", "icon: 'document',"),
        ("icon: '📋',", "icon: 'clipboard',"),
        ("icon: '⚖️',", "icon: 'scales',"),
        ("icon: '🏦',", "icon: 'bank',"),
        ("icon: '🛡️',", "icon: 'shield',"),
        ("<span>🕒 ${guide.readTime}</span>", "<span>Time: ${guide.readTime}</span>")
    ],
    r'client\js\ui\settings.js': [
        ("greeting: '⚙️ Settings',", "greeting: 'Settings',")
    ],
    r'client\js\shared.js': [
        ("// ANVAYA — Shared Client Utilities", "// ANVAYA - Shared Client Utilities"),
        ("const greeting = options.greeting || 'Namaste! 👋';", "const greeting = options.greeting || 'Namaste!';"),
        ('const subtitle = options.subtitle || "We\'re with you in every step of this journey. 🤍";', 'const subtitle = options.subtitle || "We\'re with you in every step of this journey.";')
    ],
    r'client\js\api\authApi.js': [
        ("// ANVAYA — Authentication API", "// ANVAYA - Authentication API"),
        ("console.warn('Server unavailable — running in demo mode');", "console.warn('Server unavailable - running in demo mode');"),
        ("// Real API error — re-throw so the form shows it", "// Real API error - re-throw so the form shows it")
    ]
}

base_dir = r"d:\Python\Avi.py\Anvaya"

for rel_path, reps in replacements.items():
    file_path = os.path.join(base_dir, rel_path)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in reps:
            content = content.replace(old, new)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {rel_path}")
    else:
        print(f"File not found: {file_path}")
