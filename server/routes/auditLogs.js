const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { AuditLog } = require('../models');
const auth = require('../middleware/auth');
const { requireSupervisor } = require('../middleware/rbac');

// Only supervisors and admins can view audit logs
router.get('/', auth, requireSupervisor, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.entity) where.entity = req.query.entity;
    if (req.query.userId) where.userId = req.query.userId;
    if (req.query.action) where.action = req.query.action;
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit,
      offset,
    });
    res.json({
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, requireSupervisor, async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      userId: req.user.id,
      ipAddress: req.ip,
      timestamp: new Date(),
    });
    res.status(201).json(log);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Only admins can delete audit logs
router.delete('/:id', auth, requireSupervisor, async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    await log.destroy();
    res.json({ message: 'Log deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
