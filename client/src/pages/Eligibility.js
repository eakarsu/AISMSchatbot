import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiCpu } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIResponseDisplay from '../components/AIResponseDisplay';

const formFields = [
  { key: 'applicantId', label: 'Applicant ID', type: 'number', required: true },
  { key: 'programType', label: 'Program', required: true },
  { key: 'householdSize', label: 'Household Size', type: 'number' },
  { key: 'monthlyIncome', label: 'Monthly Income', type: 'number' },
  { key: 'assets', label: 'Assets', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' },
    { value: 'needs_review', label: 'Needs Review' }
  ]}
];

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'applicantId', label: 'Applicant', render: (v, d) => d.Applicant ? `${d.Applicant.firstName} ${d.Applicant.lastName}` : `ID: ${v}` },
  { key: 'programType', label: 'Program', render: (v) => <span className="badge badge-info">{v}</span> },
  { key: 'householdSize', label: 'Household Size' },
  { key: 'monthlyIncome', label: 'Monthly Income', render: (v) => `$${parseFloat(v || 0).toFixed(2)}` },
  { key: 'assets', label: 'Assets', render: (v) => `$${parseFloat(v || 0).toFixed(2)}` },
  { key: 'isEligible', label: 'Eligible', render: (v) => <span className={`badge badge-${v ? 'approved' : 'denied'}`}>{v ? 'Yes' : 'No'}</span> },
  { key: 'score', label: 'Score', render: (v) => <span className="score-badge">{v}/100</span> },
  { key: 'aiAnalysis', label: 'AI Analysis' },
  { key: 'screeningDate', label: 'Screening Date' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v}`}>{v?.replace('_', ' ')}</span> }
];

export default function Eligibility() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [checkForm, setCheckForm] = useState({ householdSize: 3, monthlyIncome: 1500, assets: 2000, state: 'IL', programType: 'SNAP', employmentStatus: 'unemployed' });

  const load = useCallback(() => { api.get('/eligibility').then((r) => setItems(r.data)).catch(() => toast.error('Failed to load')); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) { await api.put(`/eligibility/${editing.id}`, data); toast.success('Updated!'); }
      else { await api.post('/eligibility', data); toast.success('Created!'); }
      setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this screening?')) return;
    try { await api.delete(`/eligibility/${id}`); toast.success('Deleted!'); setSelected(null); load(); }
    catch (e) { toast.error('Error deleting'); }
  };

  const runAICheck = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/eligibility-check', checkForm);
      setAiResult(res.data);
    } catch (e) { toast.error('AI service unavailable'); }
    setAiLoading(false);
  };

  const filtered = items.filter((i) => {
    const name = i.Applicant ? `${i.Applicant.firstName} ${i.Applicant.lastName}` : '';
    return `${name} ${i.programType} ${i.status}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Eligibility Screening</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><FiPlus /> New Screening</button>
        </div>
      </div>
      <div className="ai-check-panel">
        <h3><FiCpu /> AI Eligibility Check</h3>
        <div className="check-form-grid">
          <div className="form-group">
            <label>Program</label>
            <select value={checkForm.programType} onChange={(e) => setCheckForm({...checkForm, programType: e.target.value})}>
              <option value="SNAP">SNAP</option><option value="TANF">TANF</option><option value="WIC">WIC</option>
              <option value="Medicaid">Medicaid</option><option value="Housing">Housing</option>
            </select>
          </div>
          <div className="form-group"><label>Household Size</label><input type="number" value={checkForm.householdSize} onChange={(e) => setCheckForm({...checkForm, householdSize: e.target.value})} /></div>
          <div className="form-group"><label>Monthly Income ($)</label><input type="number" value={checkForm.monthlyIncome} onChange={(e) => setCheckForm({...checkForm, monthlyIncome: e.target.value})} /></div>
          <div className="form-group"><label>Total Assets ($)</label><input type="number" value={checkForm.assets} onChange={(e) => setCheckForm({...checkForm, assets: e.target.value})} /></div>
          <div className="form-group"><label>State</label><input value={checkForm.state} onChange={(e) => setCheckForm({...checkForm, state: e.target.value})} /></div>
          <div className="form-group">
            <label>Employment</label>
            <select value={checkForm.employmentStatus} onChange={(e) => setCheckForm({...checkForm, employmentStatus: e.target.value})}>
              <option value="employed">Employed</option><option value="unemployed">Unemployed</option>
              <option value="part_time">Part Time</option><option value="retired">Retired</option><option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={runAICheck} disabled={aiLoading}><FiCpu /> {aiLoading ? 'Analyzing...' : 'Run AI Eligibility Check'}</button>
      </div>
      {(aiResult || aiLoading) && <AIResponseDisplay content={aiResult?.analysis} model={aiResult?.model} usage={aiResult?.usage} loading={aiLoading} title="Eligibility Analysis" />}
      <div className="table-container">
        <table>
          <thead><tr><th>Applicant</th><th>Program</th><th>Income</th><th>Household</th><th>Eligible</th><th>Score</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td><strong>{item.Applicant ? `${item.Applicant.firstName} ${item.Applicant.lastName}` : `#${item.applicantId}`}</strong></td>
                <td><span className="badge badge-info">{item.programType}</span></td>
                <td>${parseFloat(item.monthlyIncome || 0).toFixed(2)}</td>
                <td>{item.householdSize}</td>
                <td><span className={`badge badge-${item.isEligible ? 'approved' : 'denied'}`}>{item.isEligible ? 'Yes' : 'No'}</span></td>
                <td><span className="score-badge">{item.score}</span></td>
                <td><span className={`badge badge-${item.status}`}>{item.status?.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No screenings found</div>}
      </div>
      {selected && <DetailModal title="Screening Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Eligibility Screening" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
