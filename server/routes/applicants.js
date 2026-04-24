const express = require('express');
const router = express.Router();
const { Applicant } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const applicants = await Applicant.findAll({ order: [['createdAt', 'DESC']] });
    res.json(applicants);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const applicant = await Applicant.findByPk(req.params.id);
    if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
    res.json(applicant);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const applicant = await Applicant.create(req.body);
    res.status(201).json(applicant);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
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
