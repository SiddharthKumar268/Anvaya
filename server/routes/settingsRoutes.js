// server/routes/settingsRoutes.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  exportData
} = require('../controllers/settingsController')

router.use(protect)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/password', changePassword)
router.delete('/account', deleteAccount)
router.get('/export', exportData)

module.exports = router
