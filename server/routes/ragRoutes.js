// server/routes/ragRoutes.js
const express = require('express')
const router = express.Router()

const { protect } = require('../middleware/authMiddleware')
const { askQuestion, searchKnowledge, analyzeDocument, getStatus } = require('../controllers/ragController')

router.use(protect)

router.post('/ask', askQuestion)
router.post('/analyze-document', analyzeDocument)
router.get('/search', searchKnowledge)
router.get('/status', getStatus)

module.exports = router
