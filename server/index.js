const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Audit log middleware — auto-log POST/PUT/DELETE
app.use(async (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.path !== '/api/auth/login') {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      try {
        const { AuditLog } = require('./models');
        const entityMatch = req.path.match(/^\/api\/([^/]+)/);
        const entity = entityMatch ? entityMatch[1] : 'unknown';
        const idMatch = req.path.match(/\/(\d+)/);
        AuditLog.create({
          userId: req.user?.id || null,
          action: req.method,
          entity,
          entityId: idMatch ? parseInt(idMatch[1]) : null,
          details: JSON.stringify({ body: req.body, path: req.path }),
          ipAddress: req.ip,
        }).catch(() => {});
      } catch (_) {}
      return originalJson(data);
    };
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applicants', require('./routes/applicants'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/eligibility', require('./routes/eligibility'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard stats
app.get('/api/dashboard/stats', require('./middleware/auth'), async (req, res) => {
  try {
    const { Applicant, Application, Case, Appointment, Benefit, Notification } = require('./models');
    const [applicants, applications, cases, appointments, benefits, notifications] = await Promise.all([
      Applicant.count(),
      Application.count(),
      Case.count(),
      Appointment.count({ where: { status: 'scheduled' } }),
      Benefit.count({ where: { status: 'active' } }),
      Notification.count({ where: { isRead: false } })
    ]);
    const pendingApps = await Application.count({ where: { status: 'submitted' } });
    const approvedApps = await Application.count({ where: { status: 'approved' } });
    const openCases = await Case.count({ where: { status: 'open' } });
    res.json({ applicants, applications, cases, appointments, benefits, notifications, pendingApps, approvedApps, openCases });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    // Create ai_results table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await sequelize.sync({ force: false });
    console.log('Database synced.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

startServer();

// AI feature mount: benefits-discovery
app.use('/api/ai/benefits-discovery', require('./routes/ai-benefits-discovery'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-benefitsnavigator-multiprogram-eligibilit', require('./routes/gap-no-benefitsnavigator-multiprogram-eligibilit'));
app.use('/api/gap-no-incomeverificationguide-doc-checklist-ai', require('./routes/gap-no-incomeverificationguide-doc-checklist-ai'));
app.use('/api/gap-no-appealpreparation-denialtoappeal-strategy', require('./routes/gap-no-appealpreparation-denialtoappeal-strategy'));
app.use('/api/gap-no-servicelocator-local-resources', require('./routes/gap-no-servicelocator-local-resources'));
app.use('/api/gap-no-multilingual-translation-ai', require('./routes/gap-no-multilingual-translation-ai'));
app.use('/api/gap-no-case-worker-assignmentcommunication-workf', require('./routes/gap-no-case-worker-assignmentcommunication-workf'));
app.use('/api/gap-no-benefits-expiration-renewal-reminder-auto', require('./routes/gap-no-benefits-expiration-renewal-reminder-auto'));
app.use('/api/gap-no-appeal-lifecycle-tracking', require('./routes/gap-no-appeal-lifecycle-tracking'));
app.use('/api/gap-no-smsvoice-gateway-integration-project-name', require('./routes/gap-no-smsvoice-gateway-integration-project-name'));
app.use('/api/gap-no-sso-with-state-benefit-systems', require('./routes/gap-no-sso-with-state-benefit-systems'));
app.use('/api/gap-no-public-partner-api', require('./routes/gap-no-public-partner-api'));
// === End Batch 07 ===
