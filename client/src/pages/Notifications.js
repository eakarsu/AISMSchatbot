import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiCheck } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';

const formFields = [
  { key: 'title', label: 'Title', required: true },
  { key: 'message', label: 'Message', type: 'textarea', required: true },
  { key: 'type', label: 'Type', type: 'select', options: [
    { value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' },
    { value: 'success', label: 'Success' }, { value: 'error', label: 'Error' },
    { value: 'reminder', label: 'Reminder' }
  ]},
  { key: 'category', label: 'Category' },
  { key: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }
  ]}
];

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'message', label: 'Message' },
  { key: 'type', label: 'Type', render: (v) => <span className={`badge badge-${v}`}>{v}</span> },
  { key: 'category', label: 'Category' },
  { key: 'priority', label: 'Priority', render: (v) => <span className={`badge badge-${v}`}>{v}</span> },
  { key: 'isRead', label: 'Read', render: (v) => v ? 'Yes' : 'No' },
  { key: 'createdAt', label: 'Created', render: (v) => new Date(v).toLocaleString() }
];

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => { api.get('/notifications').then((r) => setItems(r.data)).catch(() => toast.error('Failed to load')); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing) { await api.put(`/notifications/${editing.id}`, data); toast.success('Updated!'); }
      else { await api.post('/notifications', data); toast.success('Created!'); }
      setShowForm(false); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try { await api.delete(`/notifications/${id}`); toast.success('Deleted!'); setSelected(null); load(); }
    catch (e) { toast.error('Error deleting'); }
  };

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); toast.success('Marked as read'); load(); }
    catch (e) { toast.error('Error'); }
  };

  const filtered = items.filter((i) => `${i.title} ${i.message} ${i.type} ${i.category}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notifications</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><FiPlus /> New Notification</button>
        </div>
      </div>
      <div className="notifications-list">
        {filtered.map((item) => (
          <div key={item.id} className={`notification-card ${item.isRead ? 'read' : 'unread'} notification-${item.type}`} onClick={() => setSelected(item)}>
            <div className="notification-indicator"></div>
            <div className="notification-content">
              <div className="notification-header">
                <h3>{item.title}</h3>
                <div className="notification-meta">
                  <span className={`badge badge-${item.type}`}>{item.type}</span>
                  <span className={`badge badge-${item.priority}`}>{item.priority}</span>
                  {item.category && <span className="badge badge-info">{item.category}</span>}
                </div>
              </div>
              <p>{item.message}</p>
              <div className="notification-footer">
                <span className="notification-time">{new Date(item.createdAt).toLocaleString()}</span>
                {!item.isRead && <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); markRead(item.id); }}><FiCheck /> Mark Read</button>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state">No notifications</div>}
      </div>
      {selected && <DetailModal title="Notification Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Notification" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}
