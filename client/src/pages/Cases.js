import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiCpu } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIResponseDisplay from '../components/AIResponseDisplay';

const formFields = [
  { key: 'caseNumber', label: 'Case Number', required: true },
  { key: 'applicantId', label: 'Applicant ID', type: 'number', required: true },
  { key: 'applicationId', label: 'Application ID', type: 'number' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }, { value: 'closed', label: 'Closed' },
    { value: 'escalated', label: 'Escalated' }
  ]},
  { key: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }
  ]},
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'resolution', label: 'Resolution', type: 'textarea' },
  { key: 'openDate', label: 'Open Date', type: 'date' },
  { key: 'closeDate', label: 'Close Date', type: 'date' }
];

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'caseNumber', label: 'Case Number' },
  { key: 'applicantId', label: 'Applicant', render: (v, d) => d.Applicant ? `${d.Applicant.firstName} ${d.Applicant.lastName}` : `ID: ${v}` },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v}`}>{v?.replace('_', ' ')}</span> },
  { key: 'priority', label: 'Priority', render: (v) => <span className={`badge badge-${v}`}>{v}</span> },
  { key: 'description', label: 'Description' },
  { key: 'resolution', label: 'Resolution' },
  { key: 'openDate', label: 'Opened' },
  { key: 'closeDate', label: 'Closed' },
  { key: 'createdAt', label: 'Created', render: (v) => new Date(v).toLocaleDateString() }
];

export default function Cases() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(() => { api.get('/cases').then((r) => setItems(r.data)).catch(() => toast.error('Failed to load')); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) { await api.put(`/cases/${editing.id}`, data); toast.success('Updated!'); }
      else { await api.post('/cases', data); toast.success('Created!'); }
      setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this case?')) return;
    try { await api.delete(`/cases/${id}`); toast.success('Deleted!'); setSelected(null); load(); }
    catch (e) { toast.error('Error deleting'); }
  };

  const getAISummary = async (item) => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/case-summary', { caseDetails: item, applicantInfo: item.Applicant });
      setAiResult(res.data);
    } catch (e) { toast.error('AI service unavailable'); }
    setAiLoading(false);
  };

  const filtered = items.filter((i) => {
    const name = i.Applicant ? `${i.Applicant.firstName} ${i.Applicant.lastName}` : '';
    return `${name} ${i.caseNumber} ${i.type} ${i.status}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Case Management</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-secondary" onClick={() => { if (items[0]) getAISummary(items[0]); }}><FiCpu /> AI Summary</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><FiPlus /> New Case</button>
        </div>
      </div>
      {(aiResult || aiLoading) && <AIResponseDisplay content={aiResult?.summary} model={aiResult?.model} usage={aiResult?.usage} loading={aiLoading} title="AI Case Summary" />}
      <div className="table-container">
        <table>
          <thead><tr><th>Case #</th><th>Applicant</th><th>Type</th><th>Status</th><th>Priority</th><th>Opened</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td><strong>{item.caseNumber}</strong></td>
                <td>{item.Applicant ? `${item.Applicant.firstName} ${item.Applicant.lastName}` : `#${item.applicantId}`}</td>
                <td>{item.type}</td>
                <td><span className={`badge badge-${item.status}`}>{item.status?.replace('_', ' ')}</span></td>
                <td><span className={`badge badge-${item.priority}`}>{item.priority}</span></td>
                <td>{item.openDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No cases found</div>}
      </div>
      {selected && <DetailModal title="Case Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Case" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
