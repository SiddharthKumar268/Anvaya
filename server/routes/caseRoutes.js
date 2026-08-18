// server/routes/caseRoutes.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  createCase,
  getCase,
  generateChecklist,
  toggleDocument,
  generateClaims,
  getClaims,
  updateClaimStatus,
  getDashboard
} = require('../controllers/caseController')

router.post('/', protect, createCase)
router.get('/:id', protect, getCase)
router.get('/:id/dashboard', protect, getDashboard)

router.post('/:id/documents/generate', protect, generateChecklist)
router.put('/documents/:docId/toggle', protect, toggleDocument)

router.post('/:id/claims/generate', protect, generateClaims)
router.get('/:id/claims', protect, getClaims)
router.put('/claims/:claimId', protect, updateClaimStatus)

module.exports = router