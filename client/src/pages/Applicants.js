import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zipCode', label: 'Zip Code' },
  { key: 'householdSize', label: 'Household Size', type: 'number', defaultValue: 1 },
  { key: 'monthlyIncome', label: 'Monthly Income', type: 'number', defaultValue: 0 },
  { key: 'employmentStatus', label: 'Employment Status', type: 'select', options: [
    { value: 'employed', label: 'Employed' }, { value: 'unemployed', label: 'Unemployed' },
    { value: 'part_time', label: 'Part Time' }, { value: 'self_employed', label: 'Self Employed' },
    { value: 'retired', label: 'Retired' }, { value: 'disabled', label: 'Disabled' }
  ]},
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }
  ]}
];

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zipCode', label: 'Zip Code' },
  { key: 'householdSize', label: 'Household Size' },
  { key: 'monthlyIncome', label: 'Monthly Income', render: (v) => `$${parseFloat(v || 0).toFixed(2)}` },
  { key: 'employmentStatus', label: 'Employment Status', render: (v) => <span className={`badge badge-${v}`}>{v?.replace('_', ' ')}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v}`}>{v}</span> },
  { key: 'createdAt', label: 'Created', render: (v) => new Date(v).toLocaleDateString() }
];

export default function Applicants() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => { api.get('/applicants').then((r) => setItems(r.data)).catch(() => toast.error('Failed to load')); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) { await api.put(`/applicants/${editing.id}`, data); toast.success('Updated!'); }
      else { await api.post('/applicants', data); toast.success('Created!'); }
      setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this applicant?')) return;
    try { await api.delete(`/applicants/${id}`); toast.success('Deleted!'); setSelected(null); load(); }
    catch (e) { toast.error('Error deleting'); }
  };

  const filtered = items.filter((i) => `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Applicants</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><FiPlus /> New Applicant</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Household</th><th>Income</th><th>Employment</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td><strong>{item.firstName} {item.lastName}</strong></td>
                <td>{item.email}</td>
                <td>{item.phone}</td>
                <td>{item.householdSize}</td>
                <td>${parseFloat(item.monthlyIncome || 0).toFixed(2)}</td>
                <td><span className={`badge badge-${item.employmentStatus}`}>{item.employmentStatus?.replace('_', ' ')}</span></td>
                <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No applicants found</div>}
      </div>
      {selected && <DetailModal title="Applicant Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Applicant" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
