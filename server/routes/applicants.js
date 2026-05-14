const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Applicant } = require('../models');
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
    const search = req.query.search || '';
    const where = search
      ? {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};
    const { count, rows } = await Applicant.findAndCountAll({
      where,
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
    const applicant = await Applicant.findByPk(req.params.id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    res.json(applicant);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, validate([
  body('firstName').notEmpty().withMessage('firstName is required'),
  body('lastName').notEmpty().withMessage('lastName is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('householdSize').optional().isInt({ min: 1 }).withMessage('householdSize must be a positive integer'),
  body('monthlyIncome').optional().isFloat({ min: 0 }).withMessage('monthlyIncome must be non-negative'),
]), async (req, res) => {
  try {
    const applicant = await Applicant.create(req.body);
    res.status(201).json(applicant);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, validate([
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('householdSize').optional().isInt({ min: 1 }).withMessage('householdSize must be a positive integer'),
  body('monthlyIncome').optional().isFloat({ min: 0 }).withMessage('monthlyIncome must be non-negative'),
]), async (req, res) => {
  try {
    const applicant = await Applicant.findByPk(req.params.id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    await applicant.update(req.body);
    res.json(applicant);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const applicant = await Applicant.findByPk(req.params.id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    await applicant.destroy();
    res.json({ message: 'Applicant deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
