const express = require('express');
const router = express.Router();
const { Application, Applicant } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const applications = await Application.findAll({ include: [{ model: Applicant, attributes: ['firstName', 'lastName', 'email'] }], order: [['createdAt', 'DESC']] });
    res.json(applications);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, { include: [Applicant] });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const application = await Application.create(req.body);
    res.status(201).json(application);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    await application.update(req.body);
    res.json(application);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    await application.destroy();
    res.json({ message: 'Application deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
