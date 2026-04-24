import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiCpu } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIResponseDisplay from '../components/AIResponseDisplay';

const programTypes = [
  { value: 'SNAP', label: 'SNAP' }, { value: 'TANF', label: 'TANF' }, { value: 'WIC', label: 'WIC' },
  { value: 'Medicaid', label: 'Medicaid' }, { value: 'Housing', label: 'Housing' },
  { value: 'LIHEAP', label: 'LIHEAP' }, { value: 'ChildCare', label: 'Child Care' }
];

const formFields = [
  { key: 'applicantId', label: 'Applicant ID', type: 'number', required: true },
  { key: 'programType', label: 'Program', type: 'select', required: true, options: programTypes },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' }, { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' }, { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' }, { value: 'pending_info', label: 'Pending Info' }
  ]},
  { key: 'submissionDate', label: 'Submission Date', type: 'date' },
  { key: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }
  ]},
  { key: 'notes', label: 'Notes', type: 'textarea' }
];

const detailFields = [
  { key: 'id', label: 'Application ID' },
  { key: 'applicantId', label: 'Applicant', render: (v, d) => d.Applicant ? `${d.Applicant.firstName} ${d.Applicant.lastName}` : `ID: ${v}` },
  { key: 'programType', label: 'Program', render: (v) => <span className="badge badge-info">{v}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v}`}>{v?.replace('_', ' ')}</span> },
  { key: 'submissionDate', label: 'Submitted' },
  { key: 'reviewDate', label: 'Reviewed' },
  { key: 'priority', label: 'Priority', render: (v) => <span className={`badge badge-${v}`}>{v}</span> },
  { key: 'notes', label: 'Notes' },
  { key: 'createdAt', label: 'Created', render: (v) => new Date(v).toLocaleDateString() }
];

export default function Applications() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(() => { api.get('/applications').then((r) => setItems(r.data)).catch(() => toast.error('Failed to load')); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) { await api.put(`/applications/${editing.id}`, data); toast.success('Updated!'); }
      else { await api.post('/applications', data); toast.success('Created!'); }
      setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try { await api.delete(`/applications/${id}`); toast.success('Deleted!'); setSelected(null); load(); }
    catch (e) { toast.error('Error deleting'); }
  };

  const getAIHelp = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/application-help', { question: 'Provide an overview of the application review process and key things to check for each program type.', context: `Current applications: ${items.length}, pending: ${items.filter(i => i.status === 'submitted').length}` });
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
        <h1>Applications</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-secondary" onClick={getAIHelp}><FiCpu /> AI Help</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><FiPlus /> New Application</button>
        </div>
      </div>
      {(aiResult || aiLoading) && <AIResponseDisplay content={aiResult?.response} model={aiResult?.model} usage={aiResult?.usage} loading={aiLoading} title="Application Review Guide" />}
      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Applicant</th><th>Program</th><th>Status</th><th>Priority</th><th>Submitted</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td>#{item.id}</td>
                <td><strong>{item.Applicant ? `${item.Applicant.firstName} ${item.Applicant.lastName}` : `Applicant #${item.applicantId}`}</strong></td>
                <td><span className="badge badge-info">{item.programType}</span></td>
                <td><span className={`badge badge-${item.status}`}>{item.status?.replace('_', ' ')}</span></td>
                <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                <td>{item.submissionDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No applications found</div>}
      </div>
      {selected && <DetailModal title="Application Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Application" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
