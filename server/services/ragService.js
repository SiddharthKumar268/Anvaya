// server/services/ragService.js
// RAG (Retrieval Augmented Generation) service
// Uses Vectra vector database for persistent embeddings + Gemini for LLM + Intelligent Local Knowledge Fallback

const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { LocalIndex } = require('vectra')
const knowledgeChunks = require('../data/knowledgeBase')

let genAI = null
let embeddingModel = null
let chatModel = null
let vectorIndex = null
let isIndexReady = false

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.1-pro-preview'
]

// --- System Prompt ---

const SYSTEM_PROMPT = `You are Anvaya AI Assistant — a compassionate and knowledgeable guide for Indian families navigating financial recovery after losing a loved one.

RULES:
1. Answer ONLY based on the provided context. Do NOT make up information.
2. If the context does not contain enough information, say so honestly and suggest which section of Anvaya might help.
3. Be empathetic — the user is likely grieving. Use warm, supportive language.
4. Be precise — cite specific document names, form numbers, and steps.
5. Mention relevant helpline numbers when appropriate.
6. Keep answers concise but complete — no unnecessary filler.
7. Use Indian financial terminology (e.g., "₹", "lakh", "crore", "Aadhaar", "PAN").

RESPONSE FORMAT:
- If the user asks a "how to" or process question (e.g., "How to claim EPF?", "What is the process for...?", "Steps to get death certificate"), respond ONLY with a valid JSON block in this exact format:

\`\`\`guided
{
  "title": "Short title of the process",
  "steps": [
    { "heading": "Step 1 title", "detail": "Explanation of this step" },
    { "heading": "Step 2 title", "detail": "Explanation of this step" }
  ],
  "tip": "Optional helpful tip or reminder"
}
\`\`\`

- For all other questions (factual, yes/no, explanations), respond in plain text with clear formatting.
- NEVER mix both formats. Either return the guided JSON block OR plain text.`

// --- Initialization ---

function initializeModels () {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('[RAG] GEMINI_API_KEY not set — using local knowledge engine for answers')
    return false
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey)
    embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    chatModel = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
    })

    // Initialize Vectra local index (stored on disk)
    const indexPath = path.join(__dirname, '..', 'data', 'vectra_index')
    vectorIndex = new LocalIndex(indexPath)

    console.log('[RAG] Gemini models and vector index initialized')
    return true
  } catch (err) {
    console.warn('[RAG] Initialization warning:', err.message)
    return false
  }
}

async function embedText (text) {
  if (!embeddingModel) return null
  try {
    const result = await embeddingModel.embedContent(text)
    return result.embedding.values
  } catch (err) {
    console.warn('[RAG] Embedding failed (using keyword search fallback):', err.message.slice(0, 80))
    return null
  }
}

async function initializeVectorStore () {
  try {
    if (!initializeModels()) return

    // Check if index already exists on disk (skip re-embedding)
    const indexExists = await vectorIndex.isIndexCreated()

    if (indexExists) {
      // Index found on disk — load it instantly
      const stats = await vectorIndex.listItems()
      console.log(`[RAG] Vectra index loaded from disk — ${stats.length} chunks ready (no re-embedding needed)`)
      isIndexReady = true
      return
    }

    // First run — create index and embed all chunks
    console.log(`[RAG] First run — creating Vectra index and embedding ${knowledgeChunks.length} chunks...`)
    const startTime = Date.now()

    await vectorIndex.createIndex()

    for (const chunk of knowledgeChunks) {
      const textToEmbed = `${chunk.title}. ${chunk.text}`
      const vector = await embedText(textToEmbed)

      if (vector) {
        await vectorIndex.insertItem({
          vector,
          metadata: {
            id: chunk.id,
            title: chunk.title,
            category: chunk.category,
            text: chunk.text
          }
        })
      }
    }

    isIndexReady = true
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[RAG] Vectra index created — chunks embedded and saved to disk in ${elapsed}s`)
  } catch (err) {
    console.warn('[RAG] Vector store initialization warning (keyword fallback active):', err.message)
    isIndexReady = false
  }
}

// --- Keyword Search Fallback Engine ---

function keywordSearch (query, topK = 5) {
  if (!query || !knowledgeChunks || knowledgeChunks.length === 0) return []

  const q = query.toLowerCase()
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for',
    'of', 'and', 'or', 'how', 'what', 'can', 'i', 'my', 'do', 'please', 'tell',
    'me', 'about', 'with', 'from', 'this', 'that', 'should', 'would', 'could'
  ])
  const tokens = q.split(/[^a-z0-9]+/).filter(t => t.length > 2 && !stopWords.has(t))

  const scored = knowledgeChunks.map(chunk => {
    let score = 0
    const titleLower = (chunk.title || '').toLowerCase()
    const textLower = (chunk.text || '').toLowerCase()
    const idLower = (chunk.id || '').toLowerCase()
    const categoryLower = (chunk.category || '').toLowerCase()

    if (titleLower.includes(q)) score += 12
    if (textLower.includes(q)) score += 6

    for (const token of tokens) {
      if (titleLower.includes(token)) score += 4
      if (idLower.includes(token)) score += 3
      if (categoryLower.includes(token)) score += 2
      if (textLower.includes(token)) {
        const matches = (textLower.match(new RegExp(token, 'g')) || []).length
        score += Math.min(matches, 3) * 1.5
      }
    }

    return {
      id: chunk.id,
      title: chunk.title,
      category: chunk.category,
      text: chunk.text,
      score: score > 0 ? Math.min(Math.round((score / 20) * 1000) / 1000, 0.98) : 0.15
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

// --- Vector / Hybrid Search ---

async function search (query, topK = 5) {
  try {
    if (isIndexReady && vectorIndex && embeddingModel) {
      const queryVector = await embedText(query)
      if (queryVector) {
        const results = await vectorIndex.queryItems(queryVector, topK)
        if (results && results.length > 0) {
          return results.map(r => ({
            id: r.item.metadata.id,
            title: r.item.metadata.title,
            category: r.item.metadata.category,
            text: r.item.metadata.text,
            score: Math.round(r.score * 1000) / 1000
          }))
        }
      }
    }
  } catch (err) {
    console.warn('[RAG] Vector search failed (falling back to keyword search):', err.message)
  }

  // Fallback to high-relevance keyword search
  return keywordSearch(query, topK)
}

// --- Intelligent Local RAG Synthesizer ---

function generateLocalRAGAnswer (query, results, caseContext) {
  if (!results || results.length === 0) {
    return 'I could not find specific statutory guidance for your query in the Anvaya knowledge base. Please check your spelling or ask about Bank account claims, LIC insurance policies, EPFO pension/PF withdrawal, Mutual Fund transmission, or Succession Certificates.'
  }

  const qLower = query.toLowerCase()
  const isGuided = ['how', 'step', 'steps', 'process', 'procedure', 'claim', 'withdraw', 'transfer', 'mutate', 'apply', 'form', 'checklist', 'settle', 'documents', 'guide'].some(k => qLower.includes(k))

  const topChunk = results[0]
  const companionChunk = results.length > 1 && results[1].id !== topChunk.id ? results[1] : null

  if (isGuided) {
    // Break chunk text into distinct steps
    let rawSentences = topChunk.text.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 10)
    if (companionChunk && rawSentences.length < 3) {
      const extraSentences = companionChunk.text.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 10)
      rawSentences = rawSentences.concat(extraSentences)
    }

    const steps = []

    if (rawSentences.length >= 2) {
      rawSentences.slice(0, 4).forEach((sentence, idx) => {
        let heading = `Step ${idx + 1}`
        if (sentence.toLowerCase().includes('form')) {
          heading = `Step ${idx + 1}: Required Forms & Verification`
        } else if (sentence.toLowerCase().includes('submit') || sentence.toLowerCase().includes('visit') || sentence.toLowerCase().includes('contact')) {
          heading = `Step ${idx + 1}: Submission & Channel`
        } else if (sentence.toLowerCase().includes('death certificate') || sentence.toLowerCase().includes('id proof') || sentence.toLowerCase().includes('kyc')) {
          heading = `Step ${idx + 1}: Document Assembly`
        } else if (sentence.toLowerCase().includes('settle') || sentence.toLowerCase().includes('sla') || sentence.toLowerCase().includes('day') || sentence.toLowerCase().includes('timeline')) {
          heading = `Step ${idx + 1}: Processing & Settlement`
        } else {
          const words = sentence.split(' ')
          heading = `Step ${idx + 1}: ${words.slice(0, 4).join(' ')}...`
        }

        steps.push({
          heading,
          detail: sentence
        })
      })
    } else {
      steps.push({
        heading: 'Step 1: Document Verification',
        detail: topChunk.text
      })
    }

    const tip = companionChunk
      ? `Note: ${companionChunk.title} — ${companionChunk.text.slice(0, 140)}... Always carry original documents along with self-attested photocopies.`
      : 'Always carry original documents along with self-attested photocopies and cancelled cheque to the institution branch.'

    const guidedObj = {
      title: topChunk.title || 'Claim & Succession Guidance',
      steps,
      tip
    }

    return '```guided\n' + JSON.stringify(guidedObj, null, 2) + '\n```'
  }

  // Plain text explanatory response
  let answer = `**${topChunk.title}**\n\n${topChunk.text}\n\n`
  if (companionChunk) {
    answer += `**Related Reference (${companionChunk.title}):**\n${companionChunk.text}\n\n`
  }

  if (caseContext && caseContext.deceased && caseContext.deceased.fullName) {
    answer += `*Note: Personalized for ${caseContext.deceased.fullName}'s case records in Anvaya.*`
  } else {
    answer += `*Tip: You can track and mark these requirements as completed directly on your Anvaya Dashboard.*`
  }

  return answer
}

// --- RAG Answer Generation ---

async function ask (query, caseContext = null) {
  if (!genAI && process.env.GEMINI_API_KEY) {
    initializeModels()
  }

  // 1. Retrieve relevant chunks (vector or keyword)
  const results = await search(query, 5)

  // 2. If Gemini is available, attempt candidate models
  if (genAI) {
    const contextText = results
      .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.text}`)
      .join('\n\n')

    let userPrompt = `Context from Anvaya knowledge base:\n\n${contextText}\n\n`

    if (caseContext) {
      userPrompt += `User's case context: ${JSON.stringify(caseContext)}\n\n`
    }

    userPrompt += `User question: ${query}\n\nProvide a helpful, accurate answer based on the context above.`

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
        })

        const chat = model.startChat({ history: [] })

        // Race against a 15-second timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: ${modelName} took >15s`)), 15000)
        )
        const response = await Promise.race([
          chat.sendMessage(userPrompt),
          timeoutPromise
        ])
        const answer = response.response.text()

        return {
          answer,
          sources: results.map(r => ({
            id: r.id,
            title: r.title,
            category: r.category,
            score: r.score
          }))
        }
      } catch (err) {
        console.warn(`[RAG] Chat model ${modelName} unavailable (${err.message.slice(0, 80)}...), trying next...`)
      }
    }
  }

  // 3. Fallback: Intelligent Local RAG synthesis (100% uptime, zero 500 errors)
  console.log('[RAG] Generating answer via Anvaya Local Knowledge Synthesizer')
  const localAnswer = generateLocalRAGAnswer(query, results, caseContext)

  return {
    answer: localAnswer,
    sources: results.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      score: r.score
    }))
  }
}

// --- Document & PDF Analyzer Service (Multimodal Gemini AI) ---

const DOC_SYSTEM_PROMPT = `You are Anvaya AI's Expert Document Intelligence Engine for Indian Nominee Families and Asset Succession.
Your mission is to thoroughly read, analyze, and extract intelligence from any uploaded document (PDF, scanned image, photo, or document text) including Death Certificates, LIC Policy Bonds, Private Life Insurance Policies, EPF Member Passbooks/UAN Cards, Bank Passbooks, Fixed Deposit Receipts, Demat Statements, Succession Certificates, Legal Heir Certificates, Registered Wills, Court Orders, Loan Liability Agreements, and Post Office Schemes.

Analyze all text, headers, policy terms, dates, nominee declarations, seal stamps, and monetary amounts.

You MUST respond strictly with a valid JSON block enclosed inside \`\`\`json and \`\`\` without any conversational text outside:

\`\`\`json
{
  "documentType": "Exact Document Type (e.g., 'LIC Jeevan Anand Policy Bond', 'Municipal Death Certificate', 'EPFO Member Passbook', 'Bank Savings Account Passbook', 'Registered Will Deed', 'Succession Certificate')",
  "confidenceScore": 95,
  "executiveSummary": "A compassionate, clear 2-3 sentence overview explaining what this document represents, who it covers, and its legal/financial significance for the nominee family.",
  "extractedEntities": {
    "deceasedName": "Name of deceased or 'Not explicitly stated'",
    "nomineeName": "Name of registered nominee/claimant or 'No nominee specified / Missing'",
    "nomineeRelationship": "Relationship (e.g. Spouse, Son, Daughter) or 'Not specified'",
    "institutionName": "e.g. Life Insurance Corporation of India (LIC), State Bank of India, EPFO, Municipal Corporation",
    "identifierNumber": "Policy Number, Account Number, UAN, or Certificate Registration No.",
    "financialValue": "Estimated Sum Assured / Account Balance / Claim Value (e.g. '₹5,00,000 + Accrued Bonuses') or 'N/A'",
    "issueDate": "Date of issue or 'N/A'",
    "demiseDate": "Date of demise if found on doc or 'N/A'",
    "statutoryDeadline": "Applicable limitation period (e.g. '3 Years from demise under Section 39, Insurance Act' or '15 Days for Safe Deposit Locker' or 'N/A')"
  },
  "criticalAlerts": [
    "Alert 1: Important warning, missing nomination flag, limitation deadline, or procedural nuance",
    "Alert 2: Additional statutory notice or compliance requirement"
  ],
  "actionableSteps": [
    {
      "stepNumber": 1,
      "title": "Clear step title (e.g., Obtain & Complete Claim Form 3783)",
      "description": "Step-by-step instructions on where to go, what form to fill, and necessary companion documents to attach.",
      "estimatedSla": "e.g., 7-15 Working Days",
      "requiredForms": ["Form 3783", "Form 3801 (Discharge Voucher)"]
    },
    {
      "stepNumber": 2,
      "title": "Submit at Servicing Branch / Online Portal",
      "description": "Submit along with original death certificate, nominee KYC, and cancelled cheque.",
      "estimatedSla": "15-30 Days as per IRDAI / Banking SLA",
      "requiredForms": ["Original Death Certificate", "Aadhaar / PAN of Nominee", "Cancelled Cheque"]
    }
  ],
  "escalationHelpline": {
    "authority": "Grievance cell (e.g. IRDAI Bima Bharosa / RBI Banking Ombudsman / EPFiGMS)",
    "contact": "Toll Free Helpline / Portal URL"
  },
  "suggestedCaseAction": {
    "actionType": "add_claim",
    "claimType": "lic",
    "label": "Track LIC Claim in Anvaya Dashboard"
  }
}
\`\`\`
`

function generateFallbackDocAnalysis ({ fileName, mimeType, userNotes, caseContext }) {
  const lowerName = (fileName || '').toLowerCase()

  // Detect obviously unrelated documents
  const unrelatedKeywords = ['resume', 'cv', 'transcript', 'marksheet', 'etp', 'certificate', 'training', 'college', 'university', 'degree', 'diploma', 'admit', 'hall ticket', 'assignment', 'syllabus', 'internship', 'offer letter', 'appointment']
  const financialKeywords = ['death', 'insurance', 'lic', 'epf', 'pf', 'pension', 'bank', 'passbook', 'pan', 'aadhaar', 'aadhar', 'policy', 'nominee', 'fd', 'fixed deposit', 'will', 'succession', 'heir', 'locker', 'demat', 'mutual fund', 'nps', 'ppf', 'post office', 'sbi', 'hdfc', 'icici', 'axis', 'kyc', 'claim']

  const isLikelyUnrelated = unrelatedKeywords.some(kw => lowerName.includes(kw)) && !financialKeywords.some(kw => lowerName.includes(kw))

  if (isLikelyUnrelated) {
    return {
      documentType: 'UNRELATED_DOCUMENT',
      unrelated: true,
      confidenceScore: 0,
      executiveSummary: `The uploaded document "${fileName}" does not appear to be related to financial recovery, insurance claims, banking, or asset succession. Anvaya's Document Intelligence is designed to analyze legal and financial documents such as Death Certificates, Insurance Policy Bonds, Bank Passbooks, PAN/Aadhaar Cards, EPF Statements, and Succession Certificates.`,
      extractedEntities: {
        deceasedName: 'N/A', nomineeName: 'N/A', nomineeRelationship: 'N/A',
        institutionName: 'N/A', identifierNumber: 'N/A', financialValue: 'N/A',
        issueDate: 'N/A', demiseDate: 'N/A', statutoryDeadline: 'N/A'
      },
      criticalAlerts: [
        `This document appears to be an academic or professional certificate. Please upload a financial or legal document (Death Certificate, Insurance Bond, Bank Passbook, PAN Card, etc.) for AI-powered succession analysis.`
      ],
      actionableSteps: [],
      escalationHelpline: { authority: 'N/A', contact: 'N/A' },
      suggestedCaseAction: { actionType: 'none', claimType: 'none', label: 'Upload a relevant document' }
    }
  }

  let type = 'Identity / KYC Document'
  let inst = 'Government of India'
  let idNum = 'Detected from document'
  let value = 'N/A — KYC / Identity Verification Document'
  let claimType = 'common'
  let forms = ['Self-Attested Copy for Claim Submissions']

  if (lowerName.includes('death') || lowerName.includes('cert')) {
    type = 'Municipal Death Certificate'
    inst = 'Municipal Corporation / Civil Registration System (CRS)'
    idNum = 'Registration No. — as printed on certificate'
    value = 'Primary Statutory Proof Document'
    claimType = 'document'
    forms = ['Form 2 (Death Report)', 'Hospital Medical Attendant Certificate']
  } else if (lowerName.includes('lic') || lowerName.includes('insurance') || lowerName.includes('policy') || lowerName.includes('bond')) {
    type = 'Life Insurance Policy Bond'
    inst = 'Life Insurance Corporation of India (LIC)'
    idNum = 'Policy No. — as printed on bond'
    value = 'Sum Assured + Accrued Bonus (refer to document)'
    claimType = 'lic'
    forms = ['Form 3783 (Claim Form A)', 'Form 3801 (Discharge Voucher)', 'Original Policy Bond']
  } else if (lowerName.includes('epf') || lowerName.includes('uan') || lowerName.includes('pf') || lowerName.includes('pension')) {
    type = 'EPFO Member Passbook / UAN Statement'
    inst = "Employees' Provident Fund Organisation (EPFO)"
    idNum = 'UAN — as printed on passbook'
    value = 'PF Balance + EDLI Insurance (refer to document)'
    claimType = 'epf'
    forms = ['EPFO Form 10D (Family Pension)', 'EPFO Form 20 (PF Settlement)', 'EPFO Form 5IF (EDLI Insurance)']
  } else if (lowerName.includes('bank') || lowerName.includes('passbook') || lowerName.includes('statement') || lowerName.includes('sbi') || lowerName.includes('hdfc')) {
    type = 'Savings Bank Account Passbook'
    inst = 'Commercial Bank'
    idNum = 'Account No. — as printed on passbook'
    value = 'Account Balance (refer to document)'
    claimType = 'bank'
    forms = ['Bank Nominee Settlement Claim Form', 'Cancelled Cheque', 'Nominee KYC']
  } else if (lowerName.includes('pan')) {
    type = 'Permanent Account Number (PAN) Card'
    inst = 'Income Tax Department, Government of India'
    idNum = 'PAN — as printed on card'
    value = 'N/A — KYC Identity Document'
    claimType = 'common'
    forms = ['Self-Attested Copy for all Claim Submissions']
  } else if (lowerName.includes('aadhaar') || lowerName.includes('aadhar')) {
    type = 'Aadhaar Card'
    inst = 'UIDAI, Government of India'
    idNum = 'Aadhaar No. — as printed on card'
    value = 'N/A — KYC Identity Document'
    claimType = 'common'
    forms = ['Self-Attested Copy for all Claim Submissions']
  }

  const deceasedName = (caseContext && caseContext.deceased && caseContext.deceased.name) || 'Account Holder (as on document)'
  const nomineeName = (caseContext && caseContext.nominee && caseContext.nominee.name) || 'Registered Nominee / Legal Heir'
  const relation = (caseContext && caseContext.nominee && caseContext.nominee.relationship) || 'As per nomination record'

  return {
    documentType: type,
    confidenceScore: 72,
    executiveSummary: `This ${type} issued by ${inst} has been processed. The AI was unable to fully read the document contents (the AI vision service is temporarily unavailable). The analysis below is based on the filename and available metadata. For full extraction, please try again in a few moments.`,
    extractedEntities: {
      deceasedName,
      nomineeName,
      nomineeRelationship: relation,
      institutionName: inst,
      identifierNumber: idNum,
      financialValue: value,
      issueDate: 'Refer to document',
      demiseDate: (caseContext && caseContext.deceased && caseContext.deceased.dateOfDeath) || 'Refer to Death Certificate',
      statutoryDeadline: claimType === 'lic' ? '3 Years from Demise (Section 39, Insurance Act)' : (claimType === 'bank' ? 'No forfeiture, but transfer to DEAF after 10 years of inactivity' : 'Statutory limitation applies — refer to specific scheme')
    },
    criticalAlerts: [
      `AI vision service was temporarily unavailable. This analysis is based on document metadata only. Please retry for full AI-powered extraction.`,
      `For accurate data extraction, ensure the uploaded document is a clear, legible scan or photograph.`
    ],
    actionableSteps: [
      {
        stepNumber: 1,
        title: `Gather Required Documents`,
        description: `Collect the necessary companion documents: ${forms.join(', ')}. Ensure all copies are self-attested.`,
        estimatedSla: '1-3 Working Days',
        requiredForms: forms
      },
      {
        stepNumber: 2,
        title: `Submit at Relevant Authority`,
        description: `Visit the nearest ${inst} branch/office with original Death Certificate, claimant Aadhaar & PAN Card, and cancelled bank cheque.`,
        estimatedSla: '15-30 Calendar Days (Statutory SLA)',
        requiredForms: ['Original Death Certificate', 'Nominee Aadhaar Card', 'Nominee PAN Card', 'Cancelled Cheque']
      }
    ],
    escalationHelpline: {
      authority: claimType === 'lic' ? 'IRDAI Bima Bharosa' : (claimType === 'epf' ? 'EPFiGMS Portal' : 'RBI Banking Ombudsman'),
      contact: claimType === 'lic' ? '155255 / complaints@irdai.gov.in' : (claimType === 'epf' ? '1800 118 005 / epfigms.gov.in' : '14448 / cms.rbi.org.in')
    },
    suggestedCaseAction: {
      actionType: 'add_document',
      claimType,
      label: `Mark ${type} as Verified in Checklist`
    }
  }
}

async function analyzeDocument ({ fileData, mimeType, fileName, userNotes, caseContext }) {
  // Ensure Gemini models are initialized
  if (!genAI && process.env.GEMINI_API_KEY) {
    initializeModels()
  }

  // If Gemini is available, attempt multimodal analysis across candidate models
  if (genAI) {
    try {
      // Clean base64 data string
      let cleanBase64 = fileData || ''
      if (cleanBase64.includes('base64,')) {
        cleanBase64 = cleanBase64.substring(cleanBase64.indexOf('base64,') + 7)
      }

      // Determine valid mime type
      let resolvedMimeType = mimeType || 'application/pdf'
      const lowerFile = (fileName || '').toLowerCase()
      if (lowerFile.endsWith('.pdf')) resolvedMimeType = 'application/pdf'
      else if (lowerFile.endsWith('.png')) resolvedMimeType = 'image/png'
      else if (lowerFile.endsWith('.jpg') || lowerFile.endsWith('.jpeg')) resolvedMimeType = 'image/jpeg'
      else if (lowerFile.endsWith('.webp')) resolvedMimeType = 'image/webp'
      else if (lowerFile.endsWith('.txt')) resolvedMimeType = 'text/plain'

      let prompt = `You are Anvaya AI's Expert Document Intelligence Engine for Indian Nominee Families and Asset Succession.
Analyze this uploaded Indian document (${fileName || 'uploaded document'}).
Thoroughly examine all text, numbers, seal stamps, policyholder names, nominee declarations, PAN/Aadhaar numbers, account numbers, and sums in the document.

You MUST extract the REAL data from the document and return a valid JSON object matching this schema:
{
  "documentType": "Exact Document Type (e.g. 'Permanent Account Number (PAN) Card', 'LIC Jeevan Anand Policy Bond', 'Municipal Death Certificate', 'EPFO Member Passbook', 'Bank Savings Account Passbook', 'Registered Will Deed', 'Succession Certificate')",
  "confidenceScore": 98,
  "executiveSummary": "A compassionate, clear 2-3 sentence overview explaining what this specific document represents, who it belongs to, and its legal/financial significance for succession or claims in India.",
  "extractedEntities": {
    "deceasedName": "Name of deceased / cardholder / policyholder exactly as shown on the document",
    "nomineeName": "Name of registered nominee / beneficiary or 'N/A - Identity/KYC Document' or 'No Nominee Specified'",
    "nomineeRelationship": "Relationship if specified or 'Not specified'",
    "institutionName": "e.g. Income Tax Department, Life Insurance Corporation of India (LIC), State Bank of India, EPFO, Municipal Corporation",
    "identifierNumber": "PAN number, Policy number, Account number, UAN, or Certificate Registration No.",
    "financialValue": "Estimated Sum Assured / Account Balance / Claim Value or 'N/A'",
    "issueDate": "Date of issue if present or 'N/A'",
    "demiseDate": "Date of demise if found on doc or 'N/A'",
    "statutoryDeadline": "Applicable limitation period (e.g. '3 Years from demise under Section 39, Insurance Act' or 'Retain until final legal heir ITR is filed' or 'N/A')"
  },
  "criticalAlerts": [
    "Alert item 1: Key warning, limitation trap, name matching requirement, or procedural caution based on this document"
  ],
  "actionableSteps": [
    {
      "stepNumber": 1,
      "title": "Clear step title",
      "description": "Actionable instructions on where to go, what form to fill, and necessary companion documents to attach.",
      "estimatedSla": "e.g., 2-5 Days",
      "requiredForms": []
    }
  ],
  "escalationHelpline": {
    "authority": "Grievance cell (e.g. Income Tax Helpdesk / IRDAI Bima Bharosa / RBI Banking Ombudsman / EPFiGMS)",
    "contact": "Toll Free Helpline / Portal URL"
  },
  "suggestedCaseAction": {
    "actionType": "add_document",
    "claimType": "common",
    "label": "Mark Verified in Checklist"
  }
}

IMPORTANT: If this document is NOT related to Indian financial succession, insurance claims, banking, KYC identity documents (PAN/Aadhaar), asset recovery, death certificates, legal heir matters, or nominee claims — for example if it is a college certificate, resume, academic transcript, training certificate, general letter, or any other non-financial document — then set documentType to "UNRELATED_DOCUMENT" and set executiveSummary to a professional message explaining that this document does not pertain to financial recovery or asset succession. Set confidenceScore to 0 and leave extractedEntities fields as "N/A", actionableSteps as empty array, and criticalAlerts as a single item explaining what kind of document it appears to be.
`

      if (userNotes) {
        prompt += `\nUser notes / query: ${userNotes}\n`
      }
      if (caseContext) {
        prompt += `\nActive Case Context: ${JSON.stringify(caseContext)}\n`
      }

      // Prepare multimodal parts
      const parts = [
        { text: prompt },
        {
          inlineData: {
            data: cleanBase64,
            mimeType: resolvedMimeType
          }
        }
      ]

      for (const modelName of CANDIDATE_MODELS) {
        try {
          const docModel = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' }
          })

          // Race against a 20-second timeout to prevent infinite hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${modelName} took >20s`)), 20000)
          )
          const result = await Promise.race([
            docModel.generateContent(parts),
            timeoutPromise
          ])
          const text = result.response.text()

          // Parse JSON from code block or plain response
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
          const rawJson = jsonMatch ? jsonMatch[1].trim() : text.trim()

          const parsed = JSON.parse(rawJson)

          // Check if AI detected an unrelated document
          if (parsed.documentType && parsed.documentType.toUpperCase().includes('UNRELATED')) {
            console.log(`[RAG] Document flagged as unrelated by ${modelName}`)
            return { success: true, source: 'gemini_multimodal', unrelated: true, ...parsed }
          }

          console.log(`[RAG] Document analyzed successfully with ${modelName}: ${parsed.documentType || fileName}`)
          return { success: true, source: 'gemini_multimodal', ...parsed }
        } catch (mErr) {
          console.warn(`[RAG] Model ${modelName} failed (${mErr.message.slice(0, 100)}...), trying next candidate...`)
        }
      }
    } catch (err) {
      console.warn('[RAG] Gemini document analysis error (falling back to intelligent analyzer):', err.message)
    }
  }

  // Fallback intelligent heuristic analysis
  const fallback = generateFallbackDocAnalysis({ fileName, mimeType, userNotes, caseContext })
  return { success: true, source: 'anvaya_intelligence_engine', ...fallback }
}

// --- Status Check ---

function isReady () {
  return isIndexReady || (knowledgeChunks && knowledgeChunks.length > 0)
}

module.exports = { initializeVectorStore, search, ask, analyzeDocument, isReady }
