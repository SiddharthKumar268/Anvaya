// server/routes/calculatorRoutes.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  calculateBenefits,
  checkUdgam,
  getPensionBenefits,
  getPmjjbyGuide,
  getFdBreaker
} = require('../controllers/calculatorController')

router.post('/benefits', protect, calculateBenefits)
router.get('/udgam', protect, checkUdgam)
router.get('/pension/:employerType', protect, getPensionBenefits)
router.get('/pmjjby', protect, getPmjjbyGuide)
router.get('/fd-breaker', protect, getFdBreaker)

module.exports = router