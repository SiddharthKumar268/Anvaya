// server/routes/discoveryRoutes.js

const express = require('express')
const router = express.Router()
const multer = require('multer')
const { protect } = require('../middleware/authMiddleware')
const { run, confirmLead } = require('../controllers/discoveryController')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || (file.originalname && file.originalname.toLowerCase().endsWith('.csv'))) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'), false)
    }
  }
})

router.post('/analyze', protect, upload.single('statement'), run)
router.post('/confirm', protect, confirmLead)

module.exports = router
