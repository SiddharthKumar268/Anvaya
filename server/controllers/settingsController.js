// server/controllers/settingsController.js

const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = require('../models/User')
const Case = require('../models/Case')
const Document = require('../models/Document')
const Claim = require('../models/Claim')

// GET /settings/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Also fetch case info for the profile
    const cases = await Case.find({ userId: user._id }).sort({ createdAt: -1 }).limit(1)
    const activeCase = cases[0] || null

    let caseStats = null
    if (activeCase) {
      const docs = await Document.countDocuments({ caseId: activeCase._id })
      const claims = await Claim.countDocuments({ caseId: activeCase._id })
      caseStats = {
        caseId: activeCase._id,
        status: activeCase.status,
        assetsCount: activeCase.assetsDeclared ? activeCase.assetsDeclared.length : 0,
        claimsCount: claims,
        documentsCount: docs,
        nominee: activeCase.nominee || null,
        deceased: activeCase.deceased || null,
        createdAt: activeCase.createdAt
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      relationship: user.relationship || '',
      state: user.state || '',
      createdAt: user.createdAt,
      case: caseStats
    })
  } catch (err) {
    next(err)
  }
}

// PUT /settings/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, relationship, state } = req.body

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another account' })
      }
    }

    const updateFields = {}
    if (name !== undefined) updateFields.name = name.trim()
    if (email !== undefined) updateFields.email = email.trim().toLowerCase()
    if (phone !== undefined) updateFields.phone = phone.trim()
    if (relationship !== undefined) updateFields.relationship = relationship
    if (state !== undefined) updateFields.state = state

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      relationship: user.relationship || '',
      state: user.state || ''
    })
  } catch (err) {
    next(err)
  }
}

// PUT /settings/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}

// DELETE /settings/account
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id

    // Find all cases belonging to this user
    const cases = await Case.find({ userId })
    const caseIds = cases.map(c => c._id)

    // Cascade delete: documents and claims for all user's cases
    if (caseIds.length > 0) {
      await Document.deleteMany({ caseId: { $in: caseIds } })
      await Claim.deleteMany({ caseId: { $in: caseIds } })
      await Case.deleteMany({ userId })
    }

    // Delete the user
    await User.findByIdAndDelete(userId)

    res.json({ message: 'Account and all associated data deleted permanently' })
  } catch (err) {
    next(err)
  }
}

// GET /settings/export
const exportData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const cases = await Case.find({ userId: user._id })
    const caseIds = cases.map(c => c._id)

    const documents = await Document.find({ caseId: { $in: caseIds } })
    const claims = await Claim.find({ caseId: { $in: caseIds } })

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        relationship: user.relationship,
        state: user.state,
        createdAt: user.createdAt
      },
      cases: cases.map(c => ({
        caseId: c._id,
        status: c.status,
        nominee: c.nominee,
        deceased: c.deceased,
        assetsDeclared: c.assetsDeclared,
        hasLocker: c.hasLocker,
        createdAt: c.createdAt
      })),
      documents: documents.map(d => ({
        name: d.name,
        collected: d.collected,
        requiredFor: d.requiredFor,
        caseId: d.caseId,
        updatedAt: d.updatedAt
      })),
      claims: claims.map(cl => ({
        claimType: cl.claimType,
        status: cl.status,
        deadline: cl.deadline,
        filedOn: cl.filedOn,
        caseId: cl.caseId,
        updatedAt: cl.updatedAt
      }))
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="anvaya-export-${Date.now()}.json"`)
    res.json(exportPayload)
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, updateProfile, changePassword, deleteAccount, exportData }
