const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'supervisor', 'caseworker', 'reviewer'), defaultValue: 'caseworker' }
}, { tableName: 'users', timestamps: true });

// Applicant model
const Applicant = sequelize.define('Applicant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  dateOfBirth: { type: DataTypes.DATEONLY },
  ssn: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  zipCode: { type: DataTypes.STRING },
  householdSize: { type: DataTypes.INTEGER, defaultValue: 1 },
  monthlyIncome: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  employmentStatus: { type: DataTypes.ENUM('employed', 'unemployed', 'part_time', 'self_employed', 'retired', 'disabled'), defaultValue: 'unemployed' },
  status: { type: DataTypes.ENUM('active', 'inactive', 'pending'), defaultValue: 'active' }
}, { tableName: 'applicants', timestamps: true });

// Application model
const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  programType: { type: DataTypes.ENUM('SNAP', 'TANF', 'WIC', 'Medicaid', 'Housing', 'LIHEAP', 'ChildCare'), allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'denied', 'pending_info'), defaultValue: 'submitted' },
  submissionDate: { type: DataTypes.DATEONLY },
  reviewDate: { type: DataTypes.DATEONLY },
  notes: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  assignedTo: { type: DataTypes.INTEGER }
}, { tableName: 'applications', timestamps: true });

// Case model
const Case = sequelize.define('Case', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  caseNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  applicationId: { type: DataTypes.INTEGER },
  caseworkerId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed', 'escalated'), defaultValue: 'open' },
  type: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  resolution: { type: DataTypes.TEXT },
  openDate: { type: DataTypes.DATEONLY },
  closeDate: { type: DataTypes.DATEONLY },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' }
}, { tableName: 'cases', timestamps: true });

// Document model
const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  applicationId: { type: DataTypes.INTEGER },
  documentType: { type: DataTypes.ENUM('id_proof', 'income_proof', 'address_proof', 'employment_letter', 'tax_return', 'bank_statement', 'birth_certificate', 'social_security', 'medical_record', 'other'), allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'), defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT },
  uploadDate: { type: DataTypes.DATEONLY },
  expiryDate: { type: DataTypes.DATEONLY }
}, { tableName: 'documents', timestamps: true });

// Appointment model
const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  caseworkerId: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.INTEGER, defaultValue: 30 },
  type: { type: DataTypes.ENUM('initial_screening', 'interview', 'document_review', 'recertification', 'appeal', 'follow_up'), allowNull: false },
  status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'), defaultValue: 'scheduled' },
  location: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'appointments', timestamps: true });

// Benefit model
const Benefit = sequelize.define('Benefit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  applicationId: { type: DataTypes.INTEGER },
  programType: { type: DataTypes.STRING, allowNull: false },
  monthlyAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('active', 'suspended', 'terminated', 'pending'), defaultValue: 'active' },
  ebtCardNumber: { type: DataTypes.STRING },
  lastDisbursement: { type: DataTypes.DATEONLY },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'benefits', timestamps: true });

// Notification model
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  applicantId: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('info', 'warning', 'success', 'error', 'reminder'), defaultValue: 'info' },
  category: { type: DataTypes.STRING },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' }
}, { tableName: 'notifications', timestamps: true });

// EligibilityScreening model
const EligibilityScreening = sequelize.define('EligibilityScreening', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicantId: { type: DataTypes.INTEGER, allowNull: false },
  programType: { type: DataTypes.STRING, allowNull: false },
  householdSize: { type: DataTypes.INTEGER },
  monthlyIncome: { type: DataTypes.DECIMAL(10, 2) },
  assets: { type: DataTypes.DECIMAL(10, 2) },
  isEligible: { type: DataTypes.BOOLEAN },
  score: { type: DataTypes.INTEGER },
  aiAnalysis: { type: DataTypes.TEXT },
  screeningDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('pending', 'completed', 'needs_review'), defaultValue: 'pending' }
}, { tableName: 'eligibility_screenings', timestamps: true });

// AuditLog model
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING, allowNull: false },
  entity: { type: DataTypes.STRING },
  entityId: { type: DataTypes.INTEGER },
  details: { type: DataTypes.TEXT },
  ipAddress: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'audit_logs', timestamps: false });

// Associations
Applicant.hasMany(Application, { foreignKey: 'applicantId' });
Application.belongsTo(Applicant, { foreignKey: 'applicantId' });

Applicant.hasMany(Case, { foreignKey: 'applicantId' });
Case.belongsTo(Applicant, { foreignKey: 'applicantId' });

Applicant.hasMany(Document, { foreignKey: 'applicantId' });
Document.belongsTo(Applicant, { foreignKey: 'applicantId' });

Applicant.hasMany(Appointment, { foreignKey: 'applicantId' });
Appointment.belongsTo(Applicant, { foreignKey: 'applicantId' });

Applicant.hasMany(Benefit, { foreignKey: 'applicantId' });
Benefit.belongsTo(Applicant, { foreignKey: 'applicantId' });

Applicant.hasMany(EligibilityScreening, { foreignKey: 'applicantId' });
EligibilityScreening.belongsTo(Applicant, { foreignKey: 'applicantId' });

Application.hasMany(Document, { foreignKey: 'applicationId' });
Document.belongsTo(Application, { foreignKey: 'applicationId' });

Application.hasOne(Case, { foreignKey: 'applicationId' });
Case.belongsTo(Application, { foreignKey: 'applicationId' });

module.exports = {
  sequelize,
  User,
  Applicant,
  Application,
  Case,
  Document,
  Appointment,
  Benefit,
  Notification,
  EligibilityScreening,
  AuditLog
};
