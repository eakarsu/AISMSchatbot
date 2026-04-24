const express = require('express');
const router = express.Router();
const { EligibilityScreening, Applicant } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const screenings = await EligibilityScreening.findAll({ include: [{ model: Applicant, attributes: ['firstName', 'lastName'] }], order: [['createdAt', 'DESC']] });
    res.json(screenings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const screening = await EligibilityScreening.findByPk(req.params.id, { include: [Applicant] });
    if (!screening) return res.status(404).json({ error: 'Screening not found' });
    res.json(screening);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const screening = await EligibilityScreening.create(req.body);
    res.status(201).json(screening);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const screening = await EligibilityScreening.findByPk(req.params.id);
    if (!screening) return res.status(404).json({ error: 'Screening not found' });
    await screening.update(req.body);
    res.json(screening);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const screening = await EligibilityScreening.findByPk(req.params.id);
    if (!screening) return res.status(404).json({ error: 'Screening not found' });
    await screening.destroy();
    res.json({ message: 'Screening deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
