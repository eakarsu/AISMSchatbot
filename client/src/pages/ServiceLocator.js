import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiCpu, FiMapPin } from 'react-icons/fi';
import AIResponseDisplay from '../components/AIResponseDisplay';

export default function ServiceLocator() {
  const [form, setForm] = useState({
    serviceType: 'food_bank',
    location: '',
    urgency: 'standard',
    householdContext: '',
    transportation: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/service-locator', form);
      setResult(res.data);
      toast.success('Service locator results ready');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to locate services');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1><FiMapPin /> Service Locator</h1>
      </div>
      <div className="ai-check-panel">
        <h3><FiCpu /> Find local services</h3>
        <form onSubmit={submit}>
          <div className="check-form-grid">
            <div className="form-group">
              <label>Service Type</label>
              <select value={form.serviceType} onChange={(e) => handleChange('serviceType', e.target.value)}>
                <option value="food_bank">Food Bank / Pantry</option>
                <option value="free_clinic">Free / Sliding-Scale Clinic</option>
                <option value="shelter">Emergency Shelter</option>
                <option value="legal_aid">Legal Aid</option>
                <option value="wic_office">WIC Office</option>
                <option value="snap_office">SNAP Office</option>
                <option value="housing_assistance">Housing Assistance</option>
                <option value="utility_assistance">Utility Assistance (LIHEAP)</option>
                <option value="childcare">Childcare Subsidy Office</option>
                <option value="job_training">Job Training Program</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location (city, state, or ZIP)</label>
              <input value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="e.g. Chicago IL, 60601" required />
            </div>
            <div className="form-group">
              <label>Urgency</label>
              <select value={form.urgency} onChange={(e) => handleChange('urgency', e.target.value)}>
                <option value="standard">Standard</option>
                <option value="same_day">Same Day</option>
                <option value="this_week">This Week</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label>Household Context</label>
              <input value={form.householdContext} onChange={(e) => handleChange('householdContext', e.target.value)} placeholder="e.g. single parent w/ 2 kids" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Transportation</label>
              <input value={form.transportation} onChange={(e) => handleChange('transportation', e.target.value)} placeholder="e.g. no car, public transit only" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiCpu /> {loading ? 'Locating...' : 'Find Services'}
          </button>
        </form>
      </div>
      {(result || loading) && (
        <AIResponseDisplay
          content={result?.locator}
          model={result?.model}
          usage={result?.usage}
          loading={loading}
          title="Local Service Recommendations"
        />
      )}
    </div>
  );
}
