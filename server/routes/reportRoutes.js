// server/routes/reportRoutes.js

const express = require('express')
const router = express.Router()
const { optionalAuth } = require('../middleware/authMiddleware')
const { getReportSummary } = require('../controllers/reportController')

router.get('/summary/:caseId', optionalAuth, getReportSummary)
router.get('/summary', optionalAuth, getReportSummary)

module.exports = router

