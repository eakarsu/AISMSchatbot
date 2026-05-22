import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Applicants from './pages/Applicants';
import Applications from './pages/Applications';
import Cases from './pages/Cases';
import Documents from './pages/Documents';
import Appointments from './pages/Appointments';
import Benefits from './pages/Benefits';
import Notifications from './pages/Notifications';
import Eligibility from './pages/Eligibility';
import AuditLogs from './pages/AuditLogs';
import AIAssistant from './pages/AIAssistant';
import BenefitsCalculator from './pages/BenefitsCalculator';
import Reports from './pages/Reports';
import BenefitsNavigator from './pages/BenefitsNavigator';
import IncomeVerificationGuide from './pages/IncomeVerificationGuide';
import AppealPreparation from './pages/AppealPreparation';
import ServiceLocator from './pages/ServiceLocator';
import IncomeChangeAdvisor from './pages/IncomeChangeAdvisor';
import Layout from './components/Layout';

// === Batch 07 Gaps & Frontend Mounts ===
import CfComprehensiveBenefitsDiscovery from './pages/CfComprehensiveBenefitsDiscovery';
import CfLanguageAccessibility from './pages/CfLanguageAccessibility';
import CfCaseWorkerEscalationIntelligence from './pages/CfCaseWorkerEscalationIntelligence';
import CfBenefitsRetentionOptimization from './pages/CfBenefitsRetentionOptimization';
import CfIncomeChangeAdvisor from './pages/CfIncomeChangeAdvisor';
import CfAppealCoaching from './pages/CfAppealCoaching';
import GapNoBenefitsnavigatorMultiprogramEligibilit from './pages/GapNoBenefitsnavigatorMultiprogramEligibilit';
import GapNoIncomeverificationguideDocChecklistAi from './pages/GapNoIncomeverificationguideDocChecklistAi';
import GapNoAppealpreparationDenialtoappealStrategy from './pages/GapNoAppealpreparationDenialtoappealStrategy';
import GapNoServicelocatorLocalResources from './pages/GapNoServicelocatorLocalResources';
import GapNoMultilingualTranslationAi from './pages/GapNoMultilingualTranslationAi';
import GapNoCaseWorkerAssignmentcommunicationWorkf from './pages/GapNoCaseWorkerAssignmentcommunicationWorkf';
import GapNoBenefitsExpirationRenewalReminderAuto from './pages/GapNoBenefitsExpirationRenewalReminderAuto';
import GapNoAppealLifecycleTracking from './pages/GapNoAppealLifecycleTracking';
import GapNoSmsvoiceGatewayIntegrationProjectName from './pages/GapNoSmsvoiceGatewayIntegrationProjectName';
import GapNoSsoWithStateBenefitSystems from './pages/GapNoSsoWithStateBenefitSystems';
import GapNoPublicPartnerApi from './pages/GapNoPublicPartnerApi';
// === End Batch 07 ===

import './App.css';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/applicants" element={<ProtectedRoute><Applicants /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/benefits" element={<ProtectedRoute><Benefits /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/eligibility" element={<ProtectedRoute><Eligibility /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/benefits-calculator" element={<ProtectedRoute><BenefitsCalculator /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/benefits-navigator" element={<ProtectedRoute><BenefitsNavigator /></ProtectedRoute>} />
      <Route path="/income-verification-guide" element={<ProtectedRoute><IncomeVerificationGuide /></ProtectedRoute>} />
      <Route path="/appeal-preparation" element={<ProtectedRoute><AppealPreparation /></ProtectedRoute>} />
      <Route path="/service-locator" element={<ProtectedRoute><ServiceLocator /></ProtectedRoute>} />
      <Route path="/income-change-advisor" element={<ProtectedRoute><IncomeChangeAdvisor /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-comprehensive-benefits-discovery' element={<CfComprehensiveBenefitsDiscovery />} />
          <Route path='/cf-language-accessibility' element={<CfLanguageAccessibility />} />
          <Route path='/cf-case-worker-escalation-intelligence' element={<CfCaseWorkerEscalationIntelligence />} />
          <Route path='/cf-benefits-retention-optimization' element={<CfBenefitsRetentionOptimization />} />
          <Route path='/cf-income-change-advisor' element={<CfIncomeChangeAdvisor />} />
          <Route path='/cf-appeal-coaching' element={<CfAppealCoaching />} />
          <Route path='/gap-no-benefitsnavigator-multiprogram-eligibilit' element={<GapNoBenefitsnavigatorMultiprogramEligibilit />} />
          <Route path='/gap-no-incomeverificationguide-doc-checklist-ai' element={<GapNoIncomeverificationguideDocChecklistAi />} />
          <Route path='/gap-no-appealpreparation-denialtoappeal-strategy' element={<GapNoAppealpreparationDenialtoappealStrategy />} />
          <Route path='/gap-no-servicelocator-local-resources' element={<GapNoServicelocatorLocalResources />} />
          <Route path='/gap-no-multilingual-translation-ai' element={<GapNoMultilingualTranslationAi />} />
          <Route path='/gap-no-case-worker-assignmentcommunication-workf' element={<GapNoCaseWorkerAssignmentcommunicationWorkf />} />
          <Route path='/gap-no-benefits-expiration-renewal-reminder-auto' element={<GapNoBenefitsExpirationRenewalReminderAuto />} />
          <Route path='/gap-no-appeal-lifecycle-tracking' element={<GapNoAppealLifecycleTracking />} />
          <Route path='/gap-no-smsvoice-gateway-integration-project-name' element={<GapNoSmsvoiceGatewayIntegrationProjectName />} />
          <Route path='/gap-no-sso-with-state-benefit-systems' element={<GapNoSsoWithStateBenefitSystems />} />
          <Route path='/gap-no-public-partner-api' element={<GapNoPublicPartnerApi />} />
          // === End Batch 07 ===
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
