// server/routes/reportRoutes.js

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getReportSummary } = require('../controllers/reportController')

router.use(protect)

router.get('/summary/:caseId', getReportSummary)

module.exports = router
