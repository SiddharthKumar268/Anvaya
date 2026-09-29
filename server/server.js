const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const connectDB = require('./config/db')
const sanitize = require('./middleware/sanitizeMiddleware')
const logger = require('./middleware/logger')
const { generalLimiter } = require('./middleware/rateLimiter')
const { errorHandler } = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const caseRoutes = require('./routes/caseRoutes')
const calculatorRoutes = require('./routes/calculatorRoutes')
const assetRoutes = require('./routes/assetRoutes')
const safetyRoutes = require('./routes/safetyRoutes')
const guideRoutes = require('./routes/guideRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const reportRoutes = require('./routes/reportRoutes')
const ragRoutes = require('./routes/ragRoutes')
const { initializeVectorStore } = require('./services/ragService')

dotenv.config()
connectDB()

const app = express()

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'https://api.emailjs.com', 'https://generativelanguage.googleapis.com', '*'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(cors({
  origin: true,
  credentials: true
}))

app.use(logger)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(sanitize)
app.use(generalLimiter)

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/cases', caseRoutes)
app.use('/api/v1/calculators', calculatorRoutes)
app.use('/api/v1/assets', assetRoutes)
app.use('/api/v1/safety', safetyRoutes)
app.use('/api/v1/guides', guideRoutes)
app.use('/api/v1/settings', settingsRoutes)
app.use('/api/v1/reports', reportRoutes)
app.use('/api/v1/rag', ragRoutes)
app.use('/api/v1/discovery', require('./routes/discoveryRoutes'))

// EmailJS config endpoint — serves public keys from .env
app.get('/api/v1/config/emailjs', (req, res) => {
  res.json({
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY
  })
})

// Serve static frontend files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')))

// Non-API route fallback to client/index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'))
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  // Initialize RAG vector store asynchronously (non-blocking)
  initializeVectorStore().catch(err => {
    console.error('[RAG] Failed to initialize vector store:', err.message)
  })
})