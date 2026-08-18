// server/routes/assetRoutes.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getTransferSteps,
  getNoNominationPath,
  getMinorProtection,
  checkLiability,
  getLockerAlert
} = require('../controllers/assetController')

router.get('/transfer/:assetType', protect, getTransferSteps)
router.get('/no-nomination', protect, getNoNominationPath)
router.get('/minor-protection', protect, getMinorProtection)
router.get('/liability/:loanType', protect, checkLiability)
router.get('/locker-alert', protect, getLockerAlert)

module.exports = router