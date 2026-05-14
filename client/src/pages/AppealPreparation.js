import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiCpu, FiAlertCircle } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function AppealPreparation() {
  const [form, setForm] = useState({
    programType: 'SNAP',
    denialReason: '',
    deadline: '',
    supportingFacts: '',
    applicantInfo: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.denialReason.trim()) {
      toast.error('Denial reason is required');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        programType: form.programType,
        denialReason: form.denialReason,
        deadline: form.deadline,
        supportingFacts: form.supportingFacts,
        applicantInfo: form.applicantInfo ? { details: form.applicantInfo } : {},
      };
      const res = await api.post('/ai/appeal-preparation', payload);
      setResult(res.data);
      toast.success('Appeal prepared');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to prepare appeal');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><FiAlertCircle /> Appeal Preparation</h1>
      </div>
      <div className="ai-check-panel">
        <h3><FiCpu /> Draft a benefits-denial appeal</h3>
        <form onSubmit={submit}>
          <div className="check-form-grid">
            <div className="form-group">
              <label>Program</label>
              <select value={form.programType} onChange={(e) => handleChange('programType', e.target.value)}>
                <option value="SNAP">SNAP</option>
                <option value="TANF">TANF</option>
                <option value="WIC">WIC</option>
                <option value="Medicaid">Medicaid</option>
                <option value="Housing">Housing</option>
                <option value="LIHEAP">LIHEAP</option>
              </select>
            </div>
            <div className="form-group">
              <label>Appeal Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => handleChange('deadline', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Denial Reason</label>
              <input value={form.denialReason} onChange={(e) => handleChange('denialReason', e.target.value)} placeholder="e.g. income exceeds limit, missing docs" required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Supporting Facts</label>
              <textarea rows="4" value={form.supportingFacts} onChange={(e) => handleChange('supportingFacts', e.target.value)} placeholder="What changed? What evidence do you have?" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Applicant Info</label>
              <textarea rows="3" value={form.applicantInfo} onChange={(e) => handleChange('applicantInfo', e.target.value)} placeholder="Household, income, special circumstances" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiCpu /> {loading ? 'Preparing...' : 'Prepare Appeal'}
          </button>
        </form>
      </div>
      {(result || loading) && (
        <AIResponseDisplay
          content={result?.appeal}
          model={result?.model}
          usage={result?.usage}
          loading={loading}
          title="Appeal Preparation"
        />
      )}
    </div>
  );
}
