// server/routes/calculatorRoutes.js

const express = require('express')
const router = express.Router()
const { protect, optionalAuth } = require('../middleware/authMiddleware')
const {
  calculateBenefits,
  checkUdgam,
  getUdgamBanks,
  searchUdgam,
  claimToAsset,
  generateUdgamClaimLetter,
  aiPredictLostAccounts,
  getPensionBenefits,
  getPmjjbyGuide,
  getFdBreaker,
  getInvestmentRecommendations,
  calculatePensionEntitlements
} = require('../controllers/calculatorController')

router.post('/benefits', protect, calculateBenefits)
router.get('/udgam', optionalAuth, checkUdgam)
router.get('/udgam/banks', optionalAuth, getUdgamBanks)
router.post('/udgam/search', optionalAuth, searchUdgam)
router.post('/udgam/claim-to-asset', optionalAuth, claimToAsset)
router.post('/udgam/ai-letter', optionalAuth, generateUdgamClaimLetter)
router.post('/udgam/ai-detective', optionalAuth, aiPredictLostAccounts)

router.get('/pension/:employerType', protect, getPensionBenefits)
router.post('/pension/calculate', optionalAuth, calculatePensionEntitlements)
router.get('/pmjjby', protect, getPmjjbyGuide)
router.get('/fd-breaker', protect, getFdBreaker)
router.post('/recommendations', protect, getInvestmentRecommendations)

module.exports = router