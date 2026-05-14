import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiCpu, FiFileText } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function IncomeVerificationGuide() {
  const [form, setForm] = useState({
    incomeType: 'wages',
    employmentStatus: 'employed',
    programType: 'SNAP',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        incomeType: form.incomeType,
        employmentStatus: form.employmentStatus,
        programType: form.programType,
        applicantInfo: form.notes ? { notes: form.notes } : {},
      };
      const res = await api.post('/ai/income-verification-guide', payload);
      setResult(res.data);
      toast.success('Verification guide generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate guide');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><FiFileText /> Income Verification Guide</h1>
      </div>
      <div className="ai-check-panel">
        <h3><FiCpu /> What documents do I need?</h3>
        <form onSubmit={submit}>
          <div className="check-form-grid">
            <div className="form-group">
              <label>Income Type</label>
              <select value={form.incomeType} onChange={(e) => handleChange('incomeType', e.target.value)}>
                <option value="wages">Wages / Salary</option>
                <option value="self_employment">Self-Employment</option>
                <option value="unemployment">Unemployment Benefits</option>
                <option value="social_security">Social Security</option>
                <option value="disability">Disability</option>
                <option value="child_support">Child Support</option>
                <option value="cash">Cash / Tips</option>
                <option value="rental">Rental Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Employment</label>
              <select value={form.employmentStatus} onChange={(e) => handleChange('employmentStatus', e.target.value)}>
                <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="self_employed">Self-Employed</option>
                <option value="part_time">Part Time</option>
                <option value="retired">Retired</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
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
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Additional Notes</label>
              <input value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any unusual circumstances, missing docs, etc." />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiCpu /> {loading ? 'Generating...' : 'Generate Guide'}
          </button>
        </form>
      </div>
      {(result || loading) && (
        <AIResponseDisplay
          content={result?.guide}
          model={result?.model}
          usage={result?.usage}
          loading={loading}
          title="Income Verification Guide"
        />
      )}
    </div>
  );
}
