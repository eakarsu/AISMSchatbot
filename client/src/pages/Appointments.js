import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'applicantId', label: 'Applicant ID', type: 'number', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'time', label: 'Time', type: 'time', required: true },
  { key: 'duration', label: 'Duration (min)', type: 'number', defaultValue: 30 },
  { key: 'type', label: 'Type', type: 'select', required: true, options: [
    { value: 'initial_screening', label: 'Initial Screening' }, { value: 'interview', label: 'Interview' },
    { value: 'document_review', label: 'Document Review' }, { value: 'recertification', label: 'Recertification' },
    { value: 'appeal', label: 'Appeal' }, { value: 'follow_up', label: 'Follow Up' }
  ]},
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }, { value: 'no_show', label: 'No Show' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ]},
  { key: 'location', label: 'Location' },
  { key: 'notes', label: 'Notes', type: 'textarea' }
];

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'applicantId', label: 'Applicant', render: (v, d) => d.Applicant ? `${d.Applicant.firstName} ${d.Applicant.lastName}` : `ID: ${v}` },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'duration', label: 'Duration', render: (v) => `${v} minutes` },
  { key: 'type', label: 'Type', render: (v) => <span className="badge badge-info">{v?.replace('_', ' ')}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v}`}>{v?.replace('_', ' ')}</span> },
  { key: 'location', label: 'Location' },
  { key: 'notes', label: 'Notes' }
];

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => { api.get('/appointments').then((r) => setItems(r.data)).catch(() => toast.error('Failed to load')); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) { await api.put(`/appointments/${editing.id}`, data); toast.success('Updated!'); }
      else { await api.post('/appointments', data); toast.success('Created!'); }
      setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try { await api.delete(`/appointments/${id}`); toast.success('Deleted!'); setSelected(null); load(); }
    catch (e) { toast.error('Error deleting'); }
  };

  const filtered = items.filter((i) => {
    const name = i.Applicant ? `${i.Applicant.firstName} ${i.Applicant.lastName}` : '';
    return `${name} ${i.type} ${i.status} ${i.location}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Appointments</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><FiPlus /> New Appointment</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Applicant</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Location</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td><strong>{item.Applicant ? `${item.Applicant.firstName} ${item.Applicant.lastName}` : `#${item.applicantId}`}</strong></td>
                <td>{item.date}</td>
                <td>{item.time}</td>
                <td><span className="badge badge-info">{item.type?.replace('_', ' ')}</span></td>
                <td><span className={`badge badge-${item.status}`}>{item.status?.replace('_', ' ')}</span></td>
                <td>{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No appointments found</div>}
      </div>
      {selected && <DetailModal title="Appointment Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Appointment" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
