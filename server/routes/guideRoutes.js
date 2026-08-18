// server/routes/guideRoutes.js
const express = require('express')
const router = express.Router()

const { protect } = require('../middleware/authMiddleware')
const {
  getPostOfficeGuide,
  getKnowledgeHub,
  getDeathSuccessionGuide
} = require('../controllers/guideController')

router.use(protect)

router.get('/post-office/:scheme', getPostOfficeGuide)
router.get('/knowledge-hub', getKnowledgeHub)
router.get('/succession', getDeathSuccessionGuide)

module.exports = router