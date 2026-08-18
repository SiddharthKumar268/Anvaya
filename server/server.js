// server/server.js

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

dotenv.config()
connectDB()

const app = express()

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.emailjs.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'same-site' }
}))

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://localhost:5501',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:5501'
    ]
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(logger)
app.use(express.json())
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

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))