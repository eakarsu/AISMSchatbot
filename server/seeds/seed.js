const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Applicant, Application, Case, Document, Appointment, Benefit, Notification, EligibilityScreening, AuditLog } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    await sequelize.sync({ force: true });
    console.log('Tables created.');

    // Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      { email: 'admin@snapbenefits.gov', password: hashedPassword, firstName: 'Sarah', lastName: 'Johnson', role: 'admin' },
      { email: 'caseworker@snapbenefits.gov', password: hashedPassword, firstName: 'Michael', lastName: 'Chen', role: 'caseworker' },
      { email: 'reviewer@snapbenefits.gov', password: hashedPassword, firstName: 'Emily', lastName: 'Rodriguez', role: 'reviewer' }
    ]);
    console.log('Users seeded.');

    // Seed 15 Applicants
    const applicants = await Applicant.bulkCreate([
      { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@email.com', phone: '555-0101', dateOfBirth: '1985-03-15', ssn: '***-**-1234', address: '123 Oak Street', city: 'Springfield', state: 'IL', zipCode: '62701', householdSize: 4, monthlyIncome: 1800.00, employmentStatus: 'part_time', status: 'active' },
      { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@email.com', phone: '555-0102', dateOfBirth: '1990-07-22', ssn: '***-**-2345', address: '456 Elm Avenue', city: 'Chicago', state: 'IL', zipCode: '60601', householdSize: 3, monthlyIncome: 1200.00, employmentStatus: 'unemployed', status: 'active' },
      { firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@email.com', phone: '555-0103', dateOfBirth: '1978-11-08', ssn: '***-**-3456', address: '789 Pine Road', city: 'Peoria', state: 'IL', zipCode: '61602', householdSize: 5, monthlyIncome: 2200.00, employmentStatus: 'employed', status: 'active' },
      { firstName: 'Linda', lastName: 'Davis', email: 'linda.davis@email.com', phone: '555-0104', dateOfBirth: '1992-01-30', ssn: '***-**-4567', address: '321 Maple Lane', city: 'Rockford', state: 'IL', zipCode: '61101', householdSize: 2, monthlyIncome: 950.00, employmentStatus: 'unemployed', status: 'active' },
      { firstName: 'William', lastName: 'Martinez', email: 'william.martinez@email.com', phone: '555-0105', dateOfBirth: '1988-05-17', ssn: '***-**-5678', address: '654 Cedar Drive', city: 'Naperville', state: 'IL', zipCode: '60540', householdSize: 6, monthlyIncome: 2800.00, employmentStatus: 'employed', status: 'active' },
      { firstName: 'Patricia', lastName: 'Anderson', email: 'patricia.anderson@email.com', phone: '555-0106', dateOfBirth: '1975-09-03', ssn: '***-**-6789', address: '987 Birch Court', city: 'Aurora', state: 'IL', zipCode: '60502', householdSize: 1, monthlyIncome: 800.00, employmentStatus: 'disabled', status: 'active' },
      { firstName: 'David', lastName: 'Taylor', email: 'david.taylor@email.com', phone: '555-0107', dateOfBirth: '1995-12-25', ssn: '***-**-7890', address: '147 Walnut Street', city: 'Champaign', state: 'IL', zipCode: '61820', householdSize: 3, monthlyIncome: 1500.00, employmentStatus: 'part_time', status: 'active' },
      { firstName: 'Jennifer', lastName: 'Thomas', email: 'jennifer.thomas@email.com', phone: '555-0108', dateOfBirth: '1983-06-14', ssn: '***-**-8901', address: '258 Ash Boulevard', city: 'Decatur', state: 'IL', zipCode: '62521', householdSize: 4, monthlyIncome: 1100.00, employmentStatus: 'unemployed', status: 'active' },
      { firstName: 'Charles', lastName: 'Jackson', email: 'charles.jackson@email.com', phone: '555-0109', dateOfBirth: '1970-02-28', ssn: '***-**-9012', address: '369 Willow Way', city: 'Bloomington', state: 'IL', zipCode: '61701', householdSize: 2, monthlyIncome: 1650.00, employmentStatus: 'retired', status: 'active' },
      { firstName: 'Susan', lastName: 'White', email: 'susan.white@email.com', phone: '555-0110', dateOfBirth: '1998-08-09', ssn: '***-**-0123', address: '741 Spruce Place', city: 'Joliet', state: 'IL', zipCode: '60431', householdSize: 1, monthlyIncome: 600.00, employmentStatus: 'unemployed', status: 'pending' },
      { firstName: 'Daniel', lastName: 'Harris', email: 'daniel.harris@email.com', phone: '555-0111', dateOfBirth: '1987-04-11', ssn: '***-**-1122', address: '852 Hickory Lane', city: 'Evanston', state: 'IL', zipCode: '60201', householdSize: 5, monthlyIncome: 3200.00, employmentStatus: 'self_employed', status: 'active' },
      { firstName: 'Nancy', lastName: 'Clark', email: 'nancy.clark@email.com', phone: '555-0112', dateOfBirth: '1980-10-20', ssn: '***-**-2233', address: '963 Poplar Road', city: 'Elgin', state: 'IL', zipCode: '60120', householdSize: 3, monthlyIncome: 1400.00, employmentStatus: 'part_time', status: 'active' },
      { firstName: 'Christopher', lastName: 'Lewis', email: 'chris.lewis@email.com', phone: '555-0113', dateOfBirth: '1993-07-07', ssn: '***-**-3344', address: '174 Sycamore Ave', city: 'Waukegan', state: 'IL', zipCode: '60085', householdSize: 4, monthlyIncome: 1750.00, employmentStatus: 'employed', status: 'active' },
      { firstName: 'Karen', lastName: 'Robinson', email: 'karen.robinson@email.com', phone: '555-0114', dateOfBirth: '1976-03-18', ssn: '***-**-4455', address: '285 Magnolia Drive', city: 'Quincy', state: 'IL', zipCode: '62301', householdSize: 7, monthlyIncome: 2100.00, employmentStatus: 'employed', status: 'active' },
      { firstName: 'Steven', lastName: 'Walker', email: 'steven.walker@email.com', phone: '555-0115', dateOfBirth: '1991-11-29', ssn: '***-**-5566', address: '396 Dogwood Court', city: 'Carbondale', state: 'IL', zipCode: '62901', householdSize: 2, monthlyIncome: 900.00, employmentStatus: 'unemployed', status: 'active' },
      { firstName: 'Betty', lastName: 'Hall', email: 'betty.hall@email.com', phone: '555-0116', dateOfBirth: '1968-08-05', ssn: '***-**-6677', address: '507 Chestnut Lane', city: 'Normal', state: 'IL', zipCode: '61761', householdSize: 1, monthlyIncome: 1300.00, employmentStatus: 'retired', status: 'active' }
    ]);
    console.log('Applicants seeded.');

    // Seed 15 Applications
    const applications = await Application.bulkCreate([
      { applicantId: 1, programType: 'SNAP', status: 'approved', submissionDate: '2024-01-15', reviewDate: '2024-01-22', notes: 'All documents verified', priority: 'medium', assignedTo: 2 },
      { applicantId: 2, programType: 'SNAP', status: 'submitted', submissionDate: '2024-02-01', notes: 'Awaiting income verification', priority: 'high', assignedTo: 2 },
      { applicantId: 3, programType: 'TANF', status: 'under_review', submissionDate: '2024-01-20', notes: 'Large household - needs thorough review', priority: 'medium', assignedTo: 3 },
      { applicantId: 4, programType: 'SNAP', status: 'approved', submissionDate: '2024-01-10', reviewDate: '2024-01-17', notes: 'Emergency case - expedited', priority: 'urgent', assignedTo: 2 },
      { applicantId: 5, programType: 'WIC', status: 'submitted', submissionDate: '2024-02-05', notes: 'Needs pregnancy verification', priority: 'medium', assignedTo: 3 },
      { applicantId: 6, programType: 'Medicaid', status: 'approved', submissionDate: '2023-12-15', reviewDate: '2023-12-22', notes: 'Disability documentation provided', priority: 'high', assignedTo: 2 },
      { applicantId: 7, programType: 'SNAP', status: 'pending_info', submissionDate: '2024-02-08', notes: 'Missing address proof', priority: 'low', assignedTo: 3 },
      { applicantId: 8, programType: 'Housing', status: 'submitted', submissionDate: '2024-02-10', notes: 'Family with children - priority housing', priority: 'high', assignedTo: 2 },
      { applicantId: 9, programType: 'LIHEAP', status: 'approved', submissionDate: '2024-01-05', reviewDate: '2024-01-12', notes: 'Heating assistance approved for winter', priority: 'medium', assignedTo: 3 },
      { applicantId: 10, programType: 'SNAP', status: 'submitted', submissionDate: '2024-02-12', notes: 'First-time applicant', priority: 'medium', assignedTo: 2 },
      { applicantId: 11, programType: 'ChildCare', status: 'under_review', submissionDate: '2024-01-28', notes: 'Self-employed - income verification complex', priority: 'medium', assignedTo: 3 },
      { applicantId: 12, programType: 'SNAP', status: 'denied', submissionDate: '2024-01-08', reviewDate: '2024-01-15', notes: 'Income exceeds threshold', priority: 'low', assignedTo: 2 },
      { applicantId: 13, programType: 'TANF', status: 'submitted', submissionDate: '2024-02-14', notes: 'Family needs assessment', priority: 'high', assignedTo: 3 },
      { applicantId: 14, programType: 'SNAP', status: 'approved', submissionDate: '2023-12-20', reviewDate: '2023-12-28', notes: 'Large family - maximum benefit', priority: 'urgent', assignedTo: 2 },
      { applicantId: 15, programType: 'Medicaid', status: 'submitted', submissionDate: '2024-02-15', notes: 'Needs disability assessment', priority: 'high', assignedTo: 3 }
    ]);
    console.log('Applications seeded.');

    // Seed 15 Cases
    await Case.bulkCreate([
      { caseNumber: 'CASE-2024-001', applicantId: 1, applicationId: 1, caseworkerId: 2, status: 'resolved', type: 'Initial Application', description: 'SNAP application processing', resolution: 'Approved - $420/month', openDate: '2024-01-15', closeDate: '2024-01-22', priority: 'medium' },
      { caseNumber: 'CASE-2024-002', applicantId: 2, applicationId: 2, caseworkerId: 2, status: 'open', type: 'Document Request', description: 'Waiting for income verification documents', openDate: '2024-02-01', priority: 'high' },
      { caseNumber: 'CASE-2024-003', applicantId: 3, applicationId: 3, caseworkerId: 3, status: 'in_progress', type: 'Eligibility Review', description: 'TANF eligibility assessment for large household', openDate: '2024-01-20', priority: 'medium' },
      { caseNumber: 'CASE-2024-004', applicantId: 4, applicationId: 4, caseworkerId: 2, status: 'resolved', type: 'Emergency Assistance', description: 'Expedited SNAP processing', resolution: 'Emergency benefits issued', openDate: '2024-01-10', closeDate: '2024-01-12', priority: 'critical' },
      { caseNumber: 'CASE-2024-005', applicantId: 5, applicationId: 5, caseworkerId: 3, status: 'open', type: 'Verification', description: 'WIC pregnancy verification needed', openDate: '2024-02-05', priority: 'medium' },
      { caseNumber: 'CASE-2024-006', applicantId: 6, applicationId: 6, caseworkerId: 2, status: 'resolved', type: 'Disability Review', description: 'Medicaid disability verification', resolution: 'Full Medicaid coverage approved', openDate: '2023-12-15', closeDate: '2023-12-22', priority: 'high' },
      { caseNumber: 'CASE-2024-007', applicantId: 7, applicationId: 7, caseworkerId: 3, status: 'open', type: 'Missing Documents', description: 'Address proof not submitted', openDate: '2024-02-08', priority: 'low' },
      { caseNumber: 'CASE-2024-008', applicantId: 8, applicationId: 8, caseworkerId: 2, status: 'in_progress', type: 'Housing Assessment', description: 'Priority housing evaluation for family', openDate: '2024-02-10', priority: 'high' },
      { caseNumber: 'CASE-2024-009', applicantId: 9, applicationId: 9, caseworkerId: 3, status: 'resolved', type: 'Utility Assistance', description: 'LIHEAP winter heating assistance', resolution: 'Heating assistance granted - $350', openDate: '2024-01-05', closeDate: '2024-01-12', priority: 'medium' },
      { caseNumber: 'CASE-2024-010', applicantId: 10, applicationId: 10, caseworkerId: 2, status: 'open', type: 'New Application', description: 'First-time SNAP application review', openDate: '2024-02-12', priority: 'medium' },
      { caseNumber: 'CASE-2024-011', applicantId: 11, applicationId: 11, caseworkerId: 3, status: 'in_progress', type: 'Income Verification', description: 'Self-employment income documentation review', openDate: '2024-01-28', priority: 'medium' },
      { caseNumber: 'CASE-2024-012', applicantId: 12, applicationId: 12, caseworkerId: 2, status: 'closed', type: 'Appeal', description: 'Applicant appealing SNAP denial', resolution: 'Appeal denied - income verified above threshold', openDate: '2024-01-15', closeDate: '2024-02-01', priority: 'low' },
      { caseNumber: 'CASE-2024-013', applicantId: 13, applicationId: 13, caseworkerId: 3, status: 'open', type: 'Family Assessment', description: 'TANF family needs assessment', openDate: '2024-02-14', priority: 'high' },
      { caseNumber: 'CASE-2024-014', applicantId: 14, applicationId: 14, caseworkerId: 2, status: 'escalated', type: 'Recertification', description: 'Annual SNAP recertification overdue', openDate: '2024-02-01', priority: 'critical' },
      { caseNumber: 'CASE-2024-015', applicantId: 15, applicationId: 15, caseworkerId: 3, status: 'open', type: 'Disability Assessment', description: 'Medicaid disability evaluation pending', openDate: '2024-02-15', priority: 'high' }
    ]);
    console.log('Cases seeded.');

    // Seed 15 Documents
    await Document.bulkCreate([
      { applicantId: 1, applicationId: 1, documentType: 'id_proof', fileName: 'james_wilson_id.pdf', status: 'verified', notes: 'State ID verified', uploadDate: '2024-01-15', expiryDate: '2028-03-15' },
      { applicantId: 1, applicationId: 1, documentType: 'income_proof', fileName: 'james_wilson_paystub.pdf', status: 'verified', notes: 'Last 3 months paystubs', uploadDate: '2024-01-15' },
      { applicantId: 2, applicationId: 2, documentType: 'id_proof', fileName: 'maria_garcia_passport.pdf', status: 'verified', notes: 'Passport verified', uploadDate: '2024-02-01', expiryDate: '2029-07-22' },
      { applicantId: 2, applicationId: 2, documentType: 'income_proof', fileName: 'maria_garcia_unemployment.pdf', status: 'pending', notes: 'Unemployment benefits letter', uploadDate: '2024-02-01' },
      { applicantId: 3, applicationId: 3, documentType: 'address_proof', fileName: 'robert_brown_utility.pdf', status: 'verified', notes: 'Electric bill - address confirmed', uploadDate: '2024-01-20' },
      { applicantId: 4, applicationId: 4, documentType: 'bank_statement', fileName: 'linda_davis_bank.pdf', status: 'verified', notes: 'Shows minimal balance', uploadDate: '2024-01-10' },
      { applicantId: 5, applicationId: 5, documentType: 'medical_record', fileName: 'william_martinez_medical.pdf', status: 'pending', notes: 'Pregnancy verification', uploadDate: '2024-02-05' },
      { applicantId: 6, applicationId: 6, documentType: 'social_security', fileName: 'patricia_anderson_ss.pdf', status: 'verified', notes: 'SS disability letter', uploadDate: '2023-12-15' },
      { applicantId: 7, applicationId: 7, documentType: 'address_proof', fileName: 'david_taylor_lease.pdf', status: 'rejected', notes: 'Lease expired - need current document', uploadDate: '2024-02-08' },
      { applicantId: 8, applicationId: 8, documentType: 'birth_certificate', fileName: 'jennifer_thomas_birth.pdf', status: 'verified', notes: 'Child birth certificates', uploadDate: '2024-02-10' },
      { applicantId: 9, applicationId: 9, documentType: 'income_proof', fileName: 'charles_jackson_pension.pdf', status: 'verified', notes: 'Pension statement verified', uploadDate: '2024-01-05' },
      { applicantId: 10, documentType: 'id_proof', fileName: 'susan_white_id.pdf', status: 'pending', notes: 'Awaiting verification', uploadDate: '2024-02-12' },
      { applicantId: 11, applicationId: 11, documentType: 'tax_return', fileName: 'daniel_harris_tax.pdf', status: 'pending', notes: 'Self-employment tax returns', uploadDate: '2024-01-28' },
      { applicantId: 13, applicationId: 13, documentType: 'employment_letter', fileName: 'chris_lewis_employment.pdf', status: 'verified', notes: 'Employment verification letter', uploadDate: '2024-02-14' },
      { applicantId: 14, applicationId: 14, documentType: 'income_proof', fileName: 'karen_robinson_income.pdf', status: 'expired', notes: 'Needs current income docs for recertification', uploadDate: '2023-06-20', expiryDate: '2024-01-20' }
    ]);
    console.log('Documents seeded.');

    // Seed 15 Appointments
    await Appointment.bulkCreate([
      { applicantId: 1, caseworkerId: 2, date: '2024-02-20', time: '09:00', duration: 30, type: 'recertification', status: 'scheduled', location: 'Office A - Room 101', notes: 'Annual recertification interview' },
      { applicantId: 2, caseworkerId: 2, date: '2024-02-18', time: '10:30', duration: 45, type: 'initial_screening', status: 'scheduled', location: 'Office A - Room 102', notes: 'Initial SNAP screening' },
      { applicantId: 3, caseworkerId: 3, date: '2024-02-19', time: '14:00', duration: 60, type: 'interview', status: 'scheduled', location: 'Office B - Room 201', notes: 'TANF eligibility interview' },
      { applicantId: 4, caseworkerId: 2, date: '2024-01-12', time: '11:00', duration: 30, type: 'document_review', status: 'completed', location: 'Office A - Room 101', notes: 'Emergency document review' },
      { applicantId: 5, caseworkerId: 3, date: '2024-02-22', time: '09:30', duration: 45, type: 'initial_screening', status: 'scheduled', location: 'Office B - Room 202', notes: 'WIC program screening' },
      { applicantId: 6, caseworkerId: 2, date: '2024-01-18', time: '13:00', duration: 30, type: 'follow_up', status: 'completed', location: 'Office A - Room 103', notes: 'Disability benefits follow-up' },
      { applicantId: 7, caseworkerId: 3, date: '2024-02-25', time: '10:00', duration: 30, type: 'document_review', status: 'scheduled', location: 'Office B - Room 201', notes: 'Address proof review' },
      { applicantId: 8, caseworkerId: 2, date: '2024-02-21', time: '15:00', duration: 60, type: 'interview', status: 'scheduled', location: 'Office A - Room 102', notes: 'Housing needs assessment' },
      { applicantId: 9, caseworkerId: 3, date: '2024-01-10', time: '11:30', duration: 30, type: 'follow_up', status: 'completed', location: 'Office B - Room 202', notes: 'LIHEAP benefit confirmation' },
      { applicantId: 10, caseworkerId: 2, date: '2024-02-26', time: '09:00', duration: 45, type: 'initial_screening', status: 'scheduled', location: 'Office A - Room 101', notes: 'First-time applicant screening' },
      { applicantId: 11, caseworkerId: 3, date: '2024-02-15', time: '14:30', duration: 60, type: 'interview', status: 'rescheduled', location: 'Office B - Room 201', notes: 'Income verification - rescheduled' },
      { applicantId: 12, caseworkerId: 2, date: '2024-01-25', time: '10:00', duration: 45, type: 'appeal', status: 'completed', location: 'Office A - Room 103', notes: 'Appeal hearing' },
      { applicantId: 13, caseworkerId: 3, date: '2024-02-28', time: '13:30', duration: 60, type: 'interview', status: 'scheduled', location: 'Office B - Room 202', notes: 'TANF family assessment' },
      { applicantId: 14, caseworkerId: 2, date: '2024-02-17', time: '11:00', duration: 30, type: 'recertification', status: 'no_show', location: 'Office A - Room 101', notes: 'Applicant did not appear' },
      { applicantId: 15, caseworkerId: 3, date: '2024-03-01', time: '09:30', duration: 45, type: 'initial_screening', status: 'scheduled', location: 'Office B - Room 201', notes: 'Medicaid disability screening' }
    ]);
    console.log('Appointments seeded.');

    // Seed 15 Benefits
    await Benefit.bulkCreate([
      { applicantId: 1, applicationId: 1, programType: 'SNAP', monthlyAmount: 420.00, startDate: '2024-01-22', endDate: '2025-01-22', status: 'active', ebtCardNumber: 'EBT-001-2024', lastDisbursement: '2024-02-01', notes: 'Family of 4 - standard benefit' },
      { applicantId: 4, applicationId: 4, programType: 'SNAP', monthlyAmount: 291.00, startDate: '2024-01-12', endDate: '2024-07-12', status: 'active', ebtCardNumber: 'EBT-004-2024', lastDisbursement: '2024-02-01', notes: 'Emergency expedited benefit' },
      { applicantId: 6, applicationId: 6, programType: 'Medicaid', monthlyAmount: 0.00, startDate: '2023-12-22', endDate: '2024-12-22', status: 'active', notes: 'Full Medicaid coverage - disability' },
      { applicantId: 9, applicationId: 9, programType: 'LIHEAP', monthlyAmount: 350.00, startDate: '2024-01-12', endDate: '2024-04-12', status: 'active', notes: 'Winter heating assistance' },
      { applicantId: 14, applicationId: 14, programType: 'SNAP', monthlyAmount: 658.00, startDate: '2023-12-28', endDate: '2024-12-28', status: 'active', ebtCardNumber: 'EBT-014-2024', lastDisbursement: '2024-02-01', notes: 'Maximum benefit - household of 7' },
      { applicantId: 1, programType: 'Medicaid', monthlyAmount: 0.00, startDate: '2024-01-22', endDate: '2025-01-22', status: 'active', notes: 'Family Medicaid coverage' },
      { applicantId: 3, programType: 'SNAP', monthlyAmount: 510.00, startDate: '2023-06-15', endDate: '2024-06-15', status: 'active', ebtCardNumber: 'EBT-003-2023', lastDisbursement: '2024-02-01', notes: 'Pending recertification' },
      { applicantId: 8, programType: 'Housing', monthlyAmount: 800.00, startDate: '2023-09-01', endDate: '2024-09-01', status: 'active', notes: 'Section 8 housing voucher' },
      { applicantId: 5, programType: 'WIC', monthlyAmount: 150.00, startDate: '2023-11-01', endDate: '2024-11-01', status: 'active', notes: 'Prenatal nutrition assistance' },
      { applicantId: 12, programType: 'SNAP', monthlyAmount: 280.00, startDate: '2023-03-01', endDate: '2024-01-15', status: 'terminated', ebtCardNumber: 'EBT-012-2023', notes: 'Terminated - income exceeded threshold' },
      { applicantId: 7, programType: 'SNAP', monthlyAmount: 350.00, startDate: '2023-08-01', endDate: '2024-08-01', status: 'suspended', ebtCardNumber: 'EBT-007-2023', notes: 'Suspended - missing recertification docs' },
      { applicantId: 2, programType: 'SNAP', monthlyAmount: 380.00, startDate: '2023-09-15', endDate: '2024-03-15', status: 'active', ebtCardNumber: 'EBT-002-2023', lastDisbursement: '2024-02-15', notes: 'Pending new application review' },
      { applicantId: 11, programType: 'ChildCare', monthlyAmount: 600.00, startDate: '2023-10-01', endDate: '2024-10-01', status: 'pending', notes: 'Child care subsidy - under review' },
      { applicantId: 15, programType: 'SNAP', monthlyAmount: 234.00, startDate: '2023-07-01', endDate: '2024-07-01', status: 'active', ebtCardNumber: 'EBT-015-2023', lastDisbursement: '2024-02-01', notes: 'Standard benefit - household of 2' },
      { applicantId: 13, programType: 'TANF', monthlyAmount: 450.00, startDate: '2023-11-01', endDate: '2024-11-01', status: 'active', notes: 'TANF family assistance' }
    ]);
    console.log('Benefits seeded.');

    // Seed 15 Notifications
    await Notification.bulkCreate([
      { userId: 2, title: 'New Application Submitted', message: 'Maria Garcia has submitted a new SNAP application requiring review.', type: 'info', category: 'applications', priority: 'high' },
      { userId: 2, title: 'Document Verification Needed', message: 'Income proof document for Maria Garcia requires verification.', type: 'warning', category: 'documents', priority: 'medium' },
      { userId: 3, title: 'Case Escalated', message: 'Case CASE-2024-014 for Karen Robinson has been escalated - overdue recertification.', type: 'error', category: 'cases', priority: 'high' },
      { userId: 2, title: 'Appointment Reminder', message: 'Appointment with James Wilson for recertification tomorrow at 9:00 AM.', type: 'reminder', category: 'appointments', priority: 'medium' },
      { userId: 3, title: 'Application Under Review', message: 'Robert Brown TANF application moved to under review status.', type: 'info', category: 'applications', priority: 'low' },
      { userId: 2, title: 'No-Show Alert', message: 'Karen Robinson did not appear for scheduled recertification appointment.', type: 'warning', category: 'appointments', priority: 'high' },
      { userId: 1, title: 'Monthly Report Ready', message: 'January 2024 benefits disbursement report is ready for review.', type: 'info', category: 'reports', priority: 'medium' },
      { userId: 3, title: 'Document Expired', message: 'Income proof document for Karen Robinson has expired. Recertification needed.', type: 'error', category: 'documents', priority: 'high' },
      { userId: 2, title: 'Benefit Suspended', message: 'SNAP benefits for David Taylor suspended due to missing recertification documents.', type: 'warning', category: 'benefits', priority: 'medium' },
      { userId: 1, title: 'System Update', message: 'Federal poverty guidelines updated for 2024. Please review all active cases.', type: 'info', category: 'system', priority: 'high' },
      { userId: 2, title: 'New Applicant Registration', message: 'Susan White has registered as a new applicant in the system.', type: 'success', category: 'applicants', priority: 'low' },
      { userId: 3, title: 'Appeal Filed', message: 'Nancy Clark has filed an appeal for SNAP benefit denial.', type: 'warning', category: 'cases', priority: 'high' },
      { userId: 2, title: 'Emergency Application', message: 'Emergency SNAP application received from new applicant requiring expedited processing.', type: 'error', category: 'applications', priority: 'high' },
      { userId: 1, title: 'Compliance Review Due', message: 'Quarterly compliance review for all active cases is due by end of month.', type: 'reminder', category: 'compliance', priority: 'medium' },
      { userId: 3, title: 'Interview Rescheduled', message: 'Interview with Daniel Harris has been rescheduled to February 15th.', type: 'info', category: 'appointments', priority: 'low' }
    ]);
    console.log('Notifications seeded.');

    // Seed 15 Eligibility Screenings
    await EligibilityScreening.bulkCreate([
      { applicantId: 1, programType: 'SNAP', householdSize: 4, monthlyIncome: 1800.00, assets: 3500.00, isEligible: true, score: 85, aiAnalysis: 'Household income below 130% FPL for family of 4. Eligible for standard SNAP benefits.', screeningDate: '2024-01-15', status: 'completed' },
      { applicantId: 2, programType: 'SNAP', householdSize: 3, monthlyIncome: 1200.00, assets: 1200.00, isEligible: true, score: 92, aiAnalysis: 'Unemployed with low income. Qualifies for near-maximum SNAP benefit.', screeningDate: '2024-02-01', status: 'completed' },
      { applicantId: 3, programType: 'TANF', householdSize: 5, monthlyIncome: 2200.00, assets: 5000.00, isEligible: true, score: 72, aiAnalysis: 'Large household with moderate income. Eligible for TANF with conditions.', screeningDate: '2024-01-20', status: 'completed' },
      { applicantId: 4, programType: 'SNAP', householdSize: 2, monthlyIncome: 950.00, assets: 800.00, isEligible: true, score: 95, aiAnalysis: 'Very low income household. Qualifies for expedited SNAP processing.', screeningDate: '2024-01-10', status: 'completed' },
      { applicantId: 5, programType: 'WIC', householdSize: 6, monthlyIncome: 2800.00, assets: 8000.00, isEligible: true, score: 68, aiAnalysis: 'Income within WIC guidelines for household of 6. Pregnancy verification needed.', screeningDate: '2024-02-05', status: 'needs_review' },
      { applicantId: 6, programType: 'Medicaid', householdSize: 1, monthlyIncome: 800.00, assets: 2000.00, isEligible: true, score: 98, aiAnalysis: 'Disabled individual with very low income. Qualifies for full Medicaid.', screeningDate: '2023-12-15', status: 'completed' },
      { applicantId: 7, programType: 'SNAP', householdSize: 3, monthlyIncome: 1500.00, assets: 3000.00, isEligible: true, score: 78, aiAnalysis: 'Part-time employment income within eligibility range.', screeningDate: '2024-02-08', status: 'completed' },
      { applicantId: 8, programType: 'Housing', householdSize: 4, monthlyIncome: 1100.00, assets: 1500.00, isEligible: true, score: 88, aiAnalysis: 'Family with children in urgent housing need. Priority candidate.', screeningDate: '2024-02-10', status: 'completed' },
      { applicantId: 9, programType: 'LIHEAP', householdSize: 2, monthlyIncome: 1650.00, assets: 4000.00, isEligible: true, score: 75, aiAnalysis: 'Retired couple with heating assistance needs. Eligible for LIHEAP.', screeningDate: '2024-01-05', status: 'completed' },
      { applicantId: 10, programType: 'SNAP', householdSize: 1, monthlyIncome: 600.00, assets: 500.00, isEligible: true, score: 96, aiAnalysis: 'Single individual with very low income. Qualifies for maximum individual benefit.', screeningDate: '2024-02-12', status: 'pending' },
      { applicantId: 11, programType: 'ChildCare', householdSize: 5, monthlyIncome: 3200.00, assets: 10000.00, isEligible: false, score: 45, aiAnalysis: 'Self-employment income may exceed threshold. Needs detailed income verification.', screeningDate: '2024-01-28', status: 'needs_review' },
      { applicantId: 12, programType: 'SNAP', householdSize: 3, monthlyIncome: 1400.00, assets: 6000.00, isEligible: true, score: 70, aiAnalysis: 'Part-time worker, borderline eligibility. Assets need verification.', screeningDate: '2024-02-01', status: 'completed' },
      { applicantId: 13, programType: 'TANF', householdSize: 4, monthlyIncome: 1750.00, assets: 4500.00, isEligible: true, score: 76, aiAnalysis: 'Family with dependents. Eligible for TANF family assistance.', screeningDate: '2024-02-14', status: 'pending' },
      { applicantId: 14, programType: 'SNAP', householdSize: 7, monthlyIncome: 2100.00, assets: 3000.00, isEligible: true, score: 90, aiAnalysis: 'Large household well below income threshold. Maximum benefit eligible.', screeningDate: '2023-12-20', status: 'completed' },
      { applicantId: 15, programType: 'Medicaid', householdSize: 2, monthlyIncome: 900.00, assets: 1800.00, isEligible: true, score: 88, aiAnalysis: 'Low income household needs disability assessment for Medicaid eligibility.', screeningDate: '2024-02-15', status: 'pending' }
    ]);
    console.log('Eligibility screenings seeded.');

    // Seed 15 Audit Logs
    await AuditLog.bulkCreate([
      { userId: 1, action: 'LOGIN', entity: 'User', entityId: 1, details: 'Admin login successful', ipAddress: '192.168.1.1' },
      { userId: 2, action: 'CREATE', entity: 'Application', entityId: 1, details: 'Created SNAP application for James Wilson', ipAddress: '192.168.1.2' },
      { userId: 2, action: 'APPROVE', entity: 'Application', entityId: 1, details: 'Approved SNAP application - $420/month', ipAddress: '192.168.1.2' },
      { userId: 3, action: 'REVIEW', entity: 'Application', entityId: 3, details: 'Started review of TANF application for Robert Brown', ipAddress: '192.168.1.3' },
      { userId: 2, action: 'CREATE', entity: 'Case', entityId: 4, details: 'Created emergency case for Linda Davis', ipAddress: '192.168.1.2' },
      { userId: 2, action: 'VERIFY', entity: 'Document', entityId: 1, details: 'Verified ID proof for James Wilson', ipAddress: '192.168.1.2' },
      { userId: 3, action: 'SCHEDULE', entity: 'Appointment', entityId: 3, details: 'Scheduled TANF interview for Robert Brown', ipAddress: '192.168.1.3' },
      { userId: 1, action: 'GENERATE_REPORT', entity: 'Report', details: 'Generated monthly disbursement report for January 2024', ipAddress: '192.168.1.1' },
      { userId: 2, action: 'SUSPEND', entity: 'Benefit', entityId: 11, details: 'Suspended SNAP benefits for David Taylor - missing docs', ipAddress: '192.168.1.2' },
      { userId: 3, action: 'ESCALATE', entity: 'Case', entityId: 14, details: 'Escalated case for Karen Robinson - overdue recertification', ipAddress: '192.168.1.3' },
      { userId: 2, action: 'UPDATE', entity: 'Applicant', entityId: 10, details: 'Updated applicant information for Susan White', ipAddress: '192.168.1.2' },
      { userId: 1, action: 'SYSTEM_UPDATE', entity: 'System', details: 'Updated federal poverty guidelines for 2024', ipAddress: '192.168.1.1' },
      { userId: 3, action: 'DENY', entity: 'Application', entityId: 12, details: 'Denied SNAP application for Nancy Clark - income exceeds threshold', ipAddress: '192.168.1.3' },
      { userId: 2, action: 'CREATE', entity: 'Benefit', entityId: 5, details: 'Created maximum SNAP benefit for Karen Robinson', ipAddress: '192.168.1.2' },
      { userId: 1, action: 'EXPORT', entity: 'Report', details: 'Exported quarterly compliance report', ipAddress: '192.168.1.1' }
    ]);
    console.log('Audit logs seeded.');

    console.log('\n✅ All seed data loaded successfully!');
    console.log('📊 Seeded: 3 users, 16 applicants, 15 applications, 15 cases, 15 documents, 15 appointments, 15 benefits, 15 notifications, 15 eligibility screenings, 15 audit logs');
    console.log('\n🔑 Login credentials:');
    console.log('  Admin: admin@snapbenefits.gov / password123');
    console.log('  Caseworker: caseworker@snapbenefits.gov / password123');
    console.log('  Reviewer: reviewer@snapbenefits.gov / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
