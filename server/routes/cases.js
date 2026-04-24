const express = require('express');
const router = express.Router();
const { Case, Applicant, Application } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const cases = await Case.findAll({ include: [{ model: Applicant, attributes: ['firstName', 'lastName'] }], order: [['createdAt', 'DESC']] });
    res.json(cases);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const caseItem = await Case.findByPk(req.params.id, { include: [Applicant, Application] });
    if (!caseItem) return res.status(404).json({ error: 'Case not found' });
    res.json(caseItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const caseItem = await Case.create(req.body);
    res.status(201).json(caseItem);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
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
