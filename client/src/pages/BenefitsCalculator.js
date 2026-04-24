import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiCreditCard, FiCpu } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function BenefitsCalculator() {
  const [form, setForm] = useState({
    householdSize: 3, monthlyIncome: 1500, rent: 800, utilities: 150, medicalExpenses: 50, childCare: 0, state: 'IL'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/benefits-calculator', form);
      setResult(res.data);
    } catch (e) { toast.error('AI service unavailable'); }
    setLoading(false);
  };

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="page">
      <div className="page-header">
        <h1><FiCreditCard /> Benefits Calculator</h1>
        <p className="page-subtitle">AI-powered benefits estimation across all programs</p>
      </div>
      <div className="calculator-container">
        <div className="calculator-form">
          <h3>Household Information</h3>
          <div className="calc-grid">
            <div className="form-group"><label>Household Size</label><input type="number" value={form.householdSize} onChange={(e) => handleChange('householdSize', e.target.value)} min="1" /></div>
            <div className="form-group"><label>Monthly Gross Income ($)</label><input type="number" value={form.monthlyIncome} onChange={(e) => handleChange('monthlyIncome', e.target.value)} min="0" /></div>
            <div className="form-group"><label>Monthly Rent ($)</label><input type="number" value={form.rent} onChange={(e) => handleChange('rent', e.target.value)} min="0" /></div>
            <div className="form-group"><label>Monthly Utilities ($)</label><input type="number" value={form.utilities} onChange={(e) => handleChange('utilities', e.target.value)} min="0" /></div>
            <div className="form-group"><label>Monthly Medical ($)</label><input type="number" value={form.medicalExpenses} onChange={(e) => handleChange('medicalExpenses', e.target.value)} min="0" /></div>
            <div className="form-group"><label>Monthly Child Care ($)</label><input type="number" value={form.childCare} onChange={(e) => handleChange('childCare', e.target.value)} min="0" /></div>
            <div className="form-group"><label>State</label><input value={form.state} onChange={(e) => handleChange('state', e.target.value)} /></div>
          </div>
          <button className="btn btn-primary btn-full" onClick={calculate} disabled={loading}>
            <FiCpu /> {loading ? 'Calculating...' : 'Calculate Benefits'}
          </button>
        </div>
        <div className="calculator-results">
          {(result || loading) ? (
            <AIResponseDisplay content={result?.calculation} model={result?.model} usage={result?.usage} loading={loading} title="Benefits Calculation" />
          ) : (
            <div className="empty-state">
              <FiCreditCard className="empty-icon" />
              <h3>Enter household information</h3>
              <p>Fill in the form and click Calculate to get an AI-powered benefits estimate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
