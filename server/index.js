const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');
const auth = require('./middleware/auth');

validateRuntime();

const app = express();
const PORT = process.env.SERVER_PORT || 4000;
const origins = String(process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map((value) => value.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
}));
app.use(express.json({ limit:'1mb' }));

app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (_req, res) => res.json({ status:'OK', timestamp:new Date().toISOString() }));

app.use(createProviderGate(['/api/ai','/api/gap']));
app.use('/api/governed-benefit-appeals', require('./governance/router'));
app.use('/api', auth);

app.use((req, res, next) => {
  if (!['POST','PUT','PATCH','DELETE'].includes(req.method)) return next();
  res.on('finish', () => {
    try {
      const { AuditLog } = require('./models');
      const entity = (req.path.match(/^\/api\/([^/]+)/) || [,'unknown'])[1];
      AuditLog.create({
        userId: req.user.id,
        action: req.method,
        entity,
        entityId: null,
        details: JSON.stringify({ path:req.path, statusCode:res.statusCode }),
        ipAddress: req.ip,
      }).catch(() => {});
    } catch (_) {}
  });
  next();
});

app.use('/api/applicants', require('./routes/applicants'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/eligibility', require('./routes/eligibility'));
app.use('/api/audit-logs', require('./routes/auditLogs'));

app.get('/api/dashboard/stats', async (_req, res) => {
  try {
    const { Applicant, Application, Case, Appointment, Benefit, Notification } = require('./models');
    const [applicants,applications,cases,appointments,benefits,notifications,pendingApps,approvedApps,openCases] = await Promise.all([
      Applicant.count(),Application.count(),Case.count(),
      Appointment.count({where:{status:'scheduled'}}),Benefit.count({where:{status:'active'}}),
      Notification.count({where:{isRead:false}}),Application.count({where:{status:'submitted'}}),
      Application.count({where:{status:'approved'}}),Case.count({where:{status:'open'}}),
    ]);
    res.json({applicants,applications,cases,appointments,benefits,notifications,pendingApps,approvedApps,openCases});
  } catch (error) {
    res.status(500).json({ error:'Dashboard query failed' });
  }
});

if (process.env.ENABLE_LEGACY_PROVIDER_ROUTES === 'true') {
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/ai/benefits-discovery', require('./routes/ai-benefits-discovery'));
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
}

app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({ error:err.status ? err.message : 'Internal server error' });
});
app.use((_req,res)=>res.status(404).json({error:'Route not found'}));

async function startServer() {
  try {
    await sequelize.authenticate();
    if (process.env.ENABLE_LEGACY_SCHEMA_BOOTSTRAP === 'true') {
      await sequelize.query(`CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY, user_id INTEGER, endpoint VARCHAR(100),
        input_data JSONB, result JSONB, created_at TIMESTAMP DEFAULT NOW()
      )`);
      await sequelize.sync({ force:false });
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exitCode = 1;
  }
}
startServer();
