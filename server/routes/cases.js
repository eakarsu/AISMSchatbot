const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Case, Applicant, Application } = require('../models');
const auth = require('../middleware/auth');

function validate(rules) {
  return [...rules, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  }];
}

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Case.findAndCountAll({
      include: [{ model: Applicant, attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const caseItem = await Case.findByPk(req.params.id, { include: [Applicant, Application] });
    if (!caseItem) return res.status(404).json({ error: 'Case not found' });
    res.json(caseItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, validate([
  body('caseNumber').notEmpty().withMessage('caseNumber is required'),
  body('applicantId').isInt({ min: 1 }).withMessage('applicantId must be a positive integer'),
]), async (req, res) => {
  try {
    const caseItem = await Case.create(req.body);
    res.status(201).json(caseItem);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, validate([
  body('applicantId').optional().isInt({ min: 1 }).withMessage('applicantId must be a positive integer'),
]), async (req, res) => {
  try {
    const caseItem = await Case.findByPk(req.params.id);
    if (!caseItem) return res.status(404).json({ error: 'Case not found' });
    await caseItem.update(req.body);
    res.json(caseItem);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const caseItem = await Case.findByPk(req.params.id);
    if (!caseItem) return res.status(404).json({ error: 'Case not found' });
    await caseItem.destroy();
    res.json({ message: 'Case deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
