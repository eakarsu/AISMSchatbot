import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiBarChart2, FiCpu } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function Reports() {
  const [reportType, setReportType] = useState('monthly_summary');
  const [dateRange, setDateRange] = useState('January 2024 - February 2024');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'monthly_summary', label: 'Monthly Summary' },
    { value: 'application_metrics', label: 'Application Metrics' },
    { value: 'benefit_disbursement', label: 'Benefit Disbursement' },
    { value: 'case_analysis', label: 'Case Analysis' },
    { value: 'eligibility_trends', label: 'Eligibility Trends' },
    { value: 'performance_review', label: 'Performance Review' },
    { value: 'compliance_audit', label: 'Compliance Audit' },
    { value: 'demographic_analysis', label: 'Demographic Analysis' }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-report', {
        reportType: reportTypes.find(r => r.value === reportType)?.label || reportType,
        dateRange,
        data: { type: reportType, period: dateRange }
      });
      setResult(res.data);
    } catch (e) { toast.error('AI service unavailable'); }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><FiBarChart2 /> Reports & Analytics</h1>
        <p className="page-subtitle">AI-generated reports and insights</p>
      </div>
      <div className="reports-container">
        <div className="report-controls">
          <h3>Generate Report</h3>
          <div className="form-group">
            <label>Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {reportTypes.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <input value={dateRange} onChange={(e) => setDateRange(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full" onClick={generateReport} disabled={loading}>
            <FiCpu /> {loading ? 'Generating...' : 'Generate Report'}
          </button>
          <div className="report-type-cards">
            {reportTypes.map((r) => (
              <div key={r.value} className={`report-type-card ${reportType === r.value ? 'active' : ''}`} onClick={() => setReportType(r.value)}>
                <FiBarChart2 />
                <span>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="report-output">
          {(result || loading) ? (
            <AIResponseDisplay content={result?.report} model={result?.model} usage={result?.usage} loading={loading} title={`${reportTypes.find(r => r.value === reportType)?.label || ''} Report`} />
          ) : (
            <div className="empty-state">
              <FiBarChart2 className="empty-icon" />
              <h3>Select a report type</h3>
              <p>Choose a report type and date range, then click Generate to create an AI-powered report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
