// server/services/discoveryService.js

const { parse } = require('csv-parse/sync')

const RULES = [
  { re: /LIC|HDFC ?LIFE|SBI ?LIFE|ICICI ?PRU|MAX ?LIFE|BAJAJ ?ALLIANZ/, kind: 'insurance', label: 'Life insurance policy', dir: 'debit' },
  { re: /BSE ?STAR|SIP|NACH.*MF|CAMS|KFIN|MUTUAL/, kind: 'mutualfund', label: 'Mutual fund folio', dir: 'debit' },
  { re: /EMI|ACH ?D|LOAN|HOME ?FIN|BAJAJ ?FIN/, kind: 'liability', label: 'Loan / EMI', dir: 'debit' },
  { re: /DIVIDEND|IEPF|NSDL|CDSL/, kind: 'demat', label: 'Demat shares', dir: 'credit' },
  { re: /PPF|NPS|INT ?PD|INTEREST/, kind: 'savings', label: 'PPF / NPS / FD', dir: 'credit' },
  { re: /SALARY|SAL ?CR|PAYROLL/, kind: 'employer', label: 'Employer (EPF, gratuity, EDLI)', dir: 'credit' },
  { re: /RENT/, kind: 'property', label: 'Rental property', dir: 'credit' }
]

function normalize(desc) {
  return String(desc || '')
    .toUpperCase()
    .replace(/UPI|IMPS|NEFT|\d{4,}|[^A-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30)
}

function parseIndianDate(raw) {
  if (!raw) return null
  const str = String(raw).trim()

  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dmy) {
    let day = parseInt(dmy[1], 10)
    let month = parseInt(dmy[2], 10) - 1
    let year = parseInt(dmy[3], 10)
    if (year < 100) year += 2000
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  // Match DD-MMM-YYYY or DD/MMM/YYYY (e.g. 15-Jan-2025, 15/JAN/2025)
  const dMmmY = str.match(/^(\d{1,2})[\/\-\s]([A-Za-z]{3})[\/\-\s](\d{2,4})$/)
  if (dMmmY) {
    const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
    let day = parseInt(dMmmY[1], 10)
    let month = months[dMmmY[2].toLowerCase()]
    let year = parseInt(dMmmY[3], 10)
    if (year < 100) year += 2000
    if (month !== undefined) {
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) return d
    }
  }

  // Standard ISO or fallback
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function findHeaderStart(csvString) {
  const lines = csvString.split(/\r?\n/)
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const l = lines[i].toLowerCase()
    const hasDate = l.includes('date') || l.includes('txn')
    const hasFinancial = l.includes('debit') || l.includes('withdrawal') || l.includes('credit') ||
                         l.includes('deposit') || l.includes('dr') || l.includes('cr') ||
                         l.includes('narration') || l.includes('particular') || l.includes('description')
    if (hasDate && hasFinancial) {
      return lines.slice(i).join('\n')
    }
  }
  return csvString
}

function getField(row, keys) {
  const rowKeys = Object.keys(row)
  for (const k of keys) {
    const matched = rowKeys.find(rk => rk.trim().toLowerCase() === k.toLowerCase())
    if (matched && row[matched] !== undefined && row[matched] !== null) {
      const val = String(row[matched]).trim()
      if (val !== '') return val
    }
  }
  // Partial substring match fallback
  for (const k of keys) {
    const matched = rowKeys.find(rk => rk.trim().toLowerCase().includes(k.toLowerCase()))
    if (matched && row[matched] !== undefined && row[matched] !== null) {
      const val = String(row[matched]).trim()
      if (val !== '') return val
    }
  }
  return ''
}

function parseRows(buf) {
  const rawText = buf.toString('utf8')
  const cleanCsv = findHeaderStart(rawText)

  return parse(cleanCsv, {
    columns: h => h.map(x => x.trim().toLowerCase()),
    skip_empty_lines: true,
    relax_column_count: true
  }).map(r => {
    const desc = getField(r, ['description', 'narration', 'particulars', 'transaction remarks', 'transaction details', 'details', 'remarks'])
    const rawDate = getField(r, ['date', 'txn date', 'transaction date', 'tran date', 'value date'])
    const date = parseIndianDate(rawDate)

    const rawDr = getField(r, ['debit', 'withdrawal', 'withdrawal amt', 'withdrawal amount', 'amount (dr)', 'dr', 'debit amount'])
    const rawCr = getField(r, ['credit', 'deposit', 'deposit amt', 'deposit amount', 'amount (cr)', 'cr', 'credit amount'])

    let dr = parseFloat(rawDr.replace(/,/g, '')) || 0
    let cr = parseFloat(rawCr.replace(/,/g, '')) || 0

    // Handle single 'Amount' column with 'Type' or negative values
    if (!dr && !cr) {
      const rawAmt = getField(r, ['amount', 'txn amount', 'transaction amount'])
      const type = getField(r, ['type', 'cr/dr', 'txn type']).toUpperCase()
      const amtVal = parseFloat(rawAmt.replace(/,/g, '')) || 0
      if (type.includes('DR') || amtVal < 0) {
        dr = Math.abs(amtVal)
      } else if (type.includes('CR') || amtVal > 0) {
        cr = amtVal
      }
    }

    return {
      date,
      desc,
      key: normalize(desc),
      amt: dr || cr,
      dir: dr ? 'debit' : 'credit'
    }
  }).filter(t => t.amt > 0 && t.date instanceof Date && !isNaN(t.date.getTime()))
}

function detectInterval(medianDays) {
  if (medianDays >= 22 && medianDays <= 38) return 'monthly'
  if (medianDays >= 75 && medianDays <= 105) return 'quarterly'
  if (medianDays >= 165 && medianDays <= 200) return 'half-yearly'
  if (medianDays >= 340 && medianDays <= 395) return 'yearly'
  return null
}

function analyze(buf) {
  const groups = {}
  parseRows(buf).forEach(t => {
    const gk = t.dir + '|' + t.key
    ;(groups[gk] = groups[gk] || []).push(t)
  })

  const leads = []
  for (const key in groups) {
    const txns = groups[key].sort((a, b) => a.date - b.date)
    if (txns.length < 2) continue

    const gaps = txns.slice(1).map((t, i) => (t.date - txns[i].date) / 864e5).sort((a, b) => a - b)
    const median = gaps[Math.floor(gaps.length / 2)]
    const interval = detectInterval(median)

    const rule = RULES.find(r => r.re.test(txns[0].key) && r.dir === txns[0].dir)
    if (!rule) continue

    const mean = txns.reduce((s, t) => s + t.amt, 0) / txns.length
    const cv = Math.sqrt(txns.reduce((s, t) => s + (t.amt - mean) ** 2, 0) / txns.length) / mean

    let confidence = 0.4
    if (interval) confidence += 0.3
    if (cv < 0.05) confidence += 0.2
    if (txns.length >= 4) confidence += 0.1

    leads.push({
      kind: rule.kind,
      label: rule.label,
      merchant: txns[0].key,
      interval,
      avgAmount: Math.round(mean),
      count: txns.length,
      confidence: +Math.min(confidence, 1).toFixed(2),
      evidence: txns.slice(-3).map(t => ({
        date: t.date,
        amt: t.amt,
        desc: t.desc
      }))
    })
  }

  return leads.sort((a, b) => b.confidence - a.confidence)
}

module.exports = { analyze }
