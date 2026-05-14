import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiCpu, FiTrendingUp } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function IncomeChangeAdvisor() {
  const [form, setForm] = useState({
    changeType: 'job_loss',
    currentProgram: 'SNAP',
    oldMonthlyIncome: '',
    newMonthlyIncome: '',
    householdSize: 1,
    state: '',
    effectiveDate: '',
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
        ...form,
        oldMonthlyIncome: form.oldMonthlyIncome === '' ? null : parseFloat(form.oldMonthlyIncome),
        newMonthlyIncome: form.newMonthlyIncome === '' ? null : parseFloat(form.newMonthlyIncome),
        householdSize: parseInt(form.householdSize, 10),
      };
      const res = await api.post('/ai/income-change-advisor', payload);
      setResult(res.data);
      toast.success('Income change advice generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate advice');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><FiTrendingUp /> Income Change Advisor</h1>
      </div>
      <div className="ai-check-panel">
        <h3><FiCpu /> What happens if my income changes?</h3>
        <form onSubmit={submit}>
          <div className="check-form-grid">
            <div className="form-group">
              <label>Change Type</label>
              <select value={form.changeType} onChange={(e) => handleChange('changeType', e.target.value)}>
                <option value="job_loss">Job Loss</option>
                <option value="job_gained">New Job Gained</option>
                <option value="raise">Raise / Higher Wages</option>
                <option value="reduced_hours">Reduced Hours</option>
                <option value="seasonal_change">Seasonal Income Change</option>
                <option value="benefits_started">Other Benefits Started</option>
                <option value="benefits_ended">Other Benefits Ended</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current Program</label>
              <select value={form.currentProgram} onChange={(e) => handleChange('currentProgram', e.target.value)}>
                <option value="SNAP">SNAP</option>
                <option value="TANF">TANF</option>
                <option value="WIC">WIC</option>
                <option value="Medicaid">Medicaid</option>
                <option value="Housing">Housing (Section 8)</option>
                <option value="LIHEAP">LIHEAP</option>
              </select>
            </div>
            <div className="form-group">
              <label>Old Monthly Income ($)</label>
              <input type="number" min="0" step="0.01" value={form.oldMonthlyIncome} onChange={(e) => handleChange('oldMonthlyIncome', e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Monthly Income ($)</label>
              <input type="number" min="0" step="0.01" value={form.newMonthlyIncome} onChange={(e) => handleChange('newMonthlyIncome', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Household Size</label>
              <input type="number" min="1" value={form.householdSize} onChange={(e) => handleChange('householdSize', e.target.value)} />
            </div>
            <div className="form-group">
              <label>State</label>
              <input value={form.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="e.g. IL" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Effective Date</label>
              <input type="date" value={form.effectiveDate} onChange={(e) => handleChange('effectiveDate', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiCpu /> {loading ? 'Analyzing...' : 'Get Reporting Plan'}
          </button>
        </form>
      </div>
      {(result || loading) && (
        <AIResponseDisplay
          content={result?.advice}
          model={result?.model}
          usage={result?.usage}
          loading={loading}
          title="Income Change Advice"
        />
      )}
    </div>
  );
}
