const express = require('express');
const router = express.Router();
const { Benefit, Applicant } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const benefits = await Benefit.findAll({ include: [{ model: Applicant, attributes: ['firstName', 'lastName'] }], order: [['createdAt', 'DESC']] });
    res.json(benefits);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id, { include: [Applicant] });
    if (!benefit) return res.status(404).json({ error: 'Benefit not found' });
    res.json(benefit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const benefit = await Benefit.create(req.body);
    res.status(201).json(benefit);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).json({ error: 'Benefit not found' });
    await benefit.update(req.body);
    res.json(benefit);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const benefit = await Benefit.findByPk(req.params.id);
    if (!benefit) return res.status(404).json({ error: 'Benefit not found' });
    await benefit.destroy();
    res.json({ message: 'Benefit deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
