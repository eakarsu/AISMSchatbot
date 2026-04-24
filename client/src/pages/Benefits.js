import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'applicantId', label: 'Applicant ID', type: 'number', required: true },
  { key: 'applicationId', label: 'Application ID', type: 'number' },
  { key: 'programType', label: 'Program', required: true },
  { key: 'monthlyAmount', label: 'Monthly Amount', type: 'number', required: true },
  { key: 'startDate', label: 'Start Date', type: 'date', required: true },
  { key: 'endDate', label: 'End Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' },
    { value: 'terminated', label: 'Terminated' }, { value: 'pending', label: 'Pending' }
  ]},
  { key: 'ebtCardNumber', label: 'EBT Card Number' },
  { key: 'notes', label: 'Notes', type: 'textarea' }
];

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'applicantId', label: 'Applicant', render: (v, d) => d.Applicant ? `${d.Applicant.firstName} ${d.Applicant.lastName}` : `ID: ${v}` },
  { key: 'programType', label: 'Program', render: (v) => <span className="badge badge-info">{v}</span> },
  { key: 'monthlyAmount', label: 'Monthly Amount', render: (v) => `$${parseFloat(v || 0).toFixed(2)}` },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v}`}>{v}</span> },
  { key: 'ebtCardNumber', label: 'EBT Card' },
  { key: 'lastDisbursement', label: 'Last Disbursement' },
  { key: 'notes', label: 'Notes' }
];

export default function Benefits() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => { api.get('/benefits').then((r) => setItems(r.data)).catch(() => toast.error('Failed to load')); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) { await api.put(`/benefits/${editing.id}`, data); toast.success('Updated!'); }
      else { await api.post('/benefits', data); toast.success('Created!'); }
      setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this benefit?')) return;
    try { await api.delete(`/benefits/${id}`); toast.success('Deleted!'); setSelected(null); load(); }
    catch (e) { toast.error('Error deleting'); }
  };

  const filtered = items.filter((i) => {
    const name = i.Applicant ? `${i.Applicant.firstName} ${i.Applicant.lastName}` : '';
    return `${name} ${i.programType} ${i.status}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Benefits</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><FiPlus /> New Benefit</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Applicant</th><th>Program</th><th>Monthly</th><th>Status</th><th>EBT Card</th><th>Start</th><th>End</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td><strong>{item.Applicant ? `${item.Applicant.firstName} ${item.Applicant.lastName}` : `#${item.applicantId}`}</strong></td>
                <td><span className="badge badge-info">{item.programType}</span></td>
                <td className="amount">${parseFloat(item.monthlyAmount || 0).toFixed(2)}</td>
                <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                <td>{item.ebtCardNumber || '-'}</td>
                <td>{item.startDate}</td>
                <td>{item.endDate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No benefits found</div>}
      </div>
      {selected && <DetailModal title="Benefit Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Benefit" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
