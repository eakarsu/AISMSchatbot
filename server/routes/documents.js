const express = require('express');
const router = express.Router();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { Document, Applicant } = require('../models');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

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
    const { count, rows } = await Document.findAndCountAll({
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
    const document = await Document.findByPk(req.params.id, { include: [Applicant] });
    if (!document) return res.status(404).json({ error: 'Document not found' });
    res.json(document);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST with optional file upload
router.post('/', auth, upload.single('file'), validate([
  body('applicantId').isInt({ min: 1 }).withMessage('applicantId is required'),
  body('documentType').notEmpty().withMessage('documentType is required'),
]), async (req, res) => {
  try {
    const docData = { ...req.body };
    if (req.file) {
      docData.fileName = req.file.originalname;
      docData.filePath = req.file.filename;
    } else if (!docData.fileName) {
      return res.status(400).json({ error: 'Either file upload or fileName is required' });
    }
    const document = await Document.create(docData);
    res.status(201).json(document);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT with optional file upload
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) return res.status(404).json({ error: 'Document not found' });
    const updates = { ...req.body };
    if (req.file) {
      updates.fileName = req.file.originalname;
      updates.filePath = req.file.filename;
    }
    await document.update(updates);
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

// Serve uploaded files
router.get('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document || !document.filePath) return res.status(404).json({ error: 'File not found' });
    const filePath = path.join(__dirname, '../uploads', document.filePath);
    res.download(filePath, document.fileName);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
