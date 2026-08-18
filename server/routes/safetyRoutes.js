// server/routes/safetyRoutes.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getFraudAlerts,
  calculateProtectionScore,
  checkPresumedDeath
} = require('../controllers/safetyController')

router.get('/fraud-alerts', protect, getFraudAlerts)
router.post('/protection-score', protect, calculateProtectionScore)
router.get('/presumed-death', protect, checkPresumedDeath)

module.exports = router