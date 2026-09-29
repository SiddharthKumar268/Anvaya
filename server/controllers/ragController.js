// server/controllers/ragController.js

const mongoose = require('mongoose')
const ragService = require('../services/ragService')
const Case = require('../models/Case')

const askQuestion = async (req, res, next) => {
  try {
    if (!ragService.isReady()) {
      return res.status(503).json({ message: 'RAG service is still initializing. Please try again in a moment.' })
    }

    const { question, caseId } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' })
    }

    // Optionally load case context for personalized answers
    let caseContext = null
    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      const caseData = await Case.findById(caseId)
      if (caseData && caseData.userId.toString() === req.user._id.toString()) {
        caseContext = {
          assetTypes: caseData.assetsDeclared.map(a => a.type),
          hasLocker: caseData.hasLocker,
          nominee: caseData.nominee,
          deceased: caseData.deceased
        }
      }
    }

    const result = await ragService.ask(question.trim(), caseContext)

    res.json({
      answer: result.answer,
      sources: result.sources
    })
  } catch (err) {
    next(err)
  }
}

const searchKnowledge = async (req, res, next) => {
  try {
    if (!ragService.isReady()) {
      return res.status(503).json({ message: 'RAG service is still initializing. Please try again in a moment.' })
    }

    const { q } = req.query

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required' })
    }

    const results = await ragService.search(q.trim(), 10)

    res.json({ results })
  } catch (err) {
    next(err)
  }
}

const analyzeDocument = async (req, res, next) => {
  try {
    const { fileData, mimeType, fileName, userNotes, caseId } = req.body

    if (!fileData || !mimeType) {
      return res.status(400).json({ message: 'Document fileData and mimeType are required' })
    }

    // Optionally load case context for personalized guidance
    let caseContext = null
    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      const caseData = await Case.findById(caseId)
      if (caseData && caseData.userId.toString() === req.user._id.toString()) {
        caseContext = {
          nominee: caseData.nominee,
          deceased: caseData.deceased,
          assetsDeclared: caseData.assetsDeclared.map(a => a.type),
          hasLocker: caseData.hasLocker
        }
      }
    }

    const result = await ragService.analyzeDocument({
      fileData,
      mimeType,
      fileName: fileName || 'uploaded_document',
      userNotes: userNotes || '',
      caseContext
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
}

const getStatus = async (req, res) => {
  res.json({ ready: ragService.isReady() })
}

module.exports = { askQuestion, searchKnowledge, analyzeDocument, getStatus }
