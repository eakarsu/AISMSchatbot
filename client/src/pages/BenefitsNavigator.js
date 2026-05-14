import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiCpu, FiCompass } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function BenefitsNavigator() {
  const [form, setForm] = useState({
    householdSize: 3,
    monthlyIncome: 1500,
    state: 'IL',
    employmentStatus: 'unemployed',
    dependents: '',
    medicalNeeds: '',
    housingStatus: '',
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
        householdSize: parseInt(form.householdSize, 10),
        monthlyIncome: parseFloat(form.monthlyIncome),
      };
      const res = await api.post('/ai/benefits-navigator', payload);
      setResult(res.data);
      toast.success('Benefits navigation generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate navigation');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><FiCompass /> Benefits Navigator</h1>
      </div>
      <div className="ai-check-panel">
        <h3><FiCpu /> Find All Eligible Programs</h3>
        <form onSubmit={submit}>
          <div className="check-form-grid">
            <div className="form-group">
              <label>Household Size</label>
              <input type="number" min="1" value={form.householdSize} onChange={(e) => handleChange('householdSize', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Monthly Income ($)</label>
              <input type="number" min="0" step="0.01" value={form.monthlyIncome} onChange={(e) => handleChange('monthlyIncome', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>State</label>
              <input value={form.state} onChange={(e) => handleChange('state', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Employment</label>
              <select value={form.employmentStatus} onChange={(e) => handleChange('employmentStatus', e.target.value)}>
                <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="part_time">Part Time</option>
                <option value="retired">Retired</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dependents</label>
              <input value={form.dependents} onChange={(e) => handleChange('dependents', e.target.value)} placeholder="e.g. 2 children, 1 elderly" />
            </div>
            <div className="form-group">
              <label>Medical Needs</label>
              <input value={form.medicalNeeds} onChange={(e) => handleChange('medicalNeeds', e.target.value)} placeholder="e.g. diabetes, pregnancy" />
            </div>
            <div className="form-group">
              <label>Housing Status</label>
              <input value={form.housingStatus} onChange={(e) => handleChange('housingStatus', e.target.value)} placeholder="e.g. renter, homeless, owns" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiCpu /> {loading ? 'Analyzing...' : 'Find Eligible Programs'}
          </button>
        </form>
      </div>
      {(result || loading) && (
        <AIResponseDisplay
          content={result?.navigation}
          model={result?.model}
          usage={result?.usage}
          loading={loading}
          title="Eligible Benefits Programs"
        />
      )}
    </div>
  );
}
