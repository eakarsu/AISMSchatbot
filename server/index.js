const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
    await sequelize.sync({ alter: true });
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
