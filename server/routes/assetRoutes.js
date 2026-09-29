// server/routes/assetRoutes.js

const express = require('express')
const router = express.Router()
const { protect, optionalAuth } = require('../middleware/authMiddleware')
const {
  getTransferSteps,
  getNoNominationPath,
  getMinorProtection,
  checkLiability,
  getLockerAlert,
  createAsset,
  getAssets,
  updateAsset,
  deleteAsset,
  draftAssetLetter
} = require('../controllers/assetController')

router.get('/', protect, getAssets)
router.get('/case/:caseId', protect, getAssets)
router.post('/', protect, createAsset)
router.put('/:id', protect, updateAsset)
router.delete('/:id', protect, deleteAsset)
router.post('/draft-letter', optionalAuth, draftAssetLetter)

router.get('/transfer/:assetType', protect, getTransferSteps)
router.get('/no-nomination', protect, getNoNominationPath)
router.get('/minor-protection', protect, getMinorProtection)
router.get('/liability/:loanType', protect, checkLiability)
router.get('/locker-alert', protect, getLockerAlert)

module.exports = router