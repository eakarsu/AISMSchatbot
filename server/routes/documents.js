const express = require('express');
const router = express.Router();
const { Document, Applicant } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.findAll({ include: [{ model: Applicant, attributes: ['firstName', 'lastName'] }], order: [['createdAt', 'DESC']] });
    res.json(documents);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, { include: [Applicant] });
    if (!document) return res.status(404).json({ error: 'Document not found' });
    res.json(document);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const document = await Document.create(req.body);
    res.status(201).json(document);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    await document.update(req.body);
    res.json(document);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
