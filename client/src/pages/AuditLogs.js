import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import Pagination from '../components/Pagination';

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'userId', label: 'User ID' },
  { key: 'action', label: 'Action', render: (v) => <span className={`badge badge-action-${v?.toLowerCase()}`}>{v}</span> },
  { key: 'entity', label: 'Entity' },
  { key: 'entityId', label: 'Entity ID' },
  { key: 'details', label: 'Details' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'timestamp', label: 'Timestamp', render: (v) => new Date(v).toLocaleString() }
];

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const load = useCallback((page = 1) => {
    let url = `/audit-logs?page=${page}&limit=20`;
    if (filterEntity) url += `&entity=${encodeURIComponent(filterEntity)}`;
    if (filterAction) url += `&action=${encodeURIComponent(filterAction)}`;
    api.get(url)
      .then((r) => {
        if (Array.isArray(r.data)) { setItems(r.data); }
        else { setItems(r.data.data || []); setPagination(r.data.pagination || { page: 1, totalPages: 1 }); }
      })
      .catch(() => toast.error('Failed to load audit logs (requires supervisor role)'));
  }, [filterEntity, filterAction]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log entry?')) return;
    try { await api.delete(`/audit-logs/${id}`); toast.success('Deleted!'); setSelected(null); load(pagination.page); }
    catch (e) { toast.error('Error deleting'); }
  };

  const filtered = items.filter((i) => `${i.action} ${i.entity} ${i.details}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px' }}>
            <option value="">All Entities</option>
            <option value="applicants">Applicants</option>
            <option value="applications">Applications</option>
            <option value="cases">Cases</option>
            <option value="documents">Documents</option>
            <option value="appointments">Appointments</option>
          </select>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px' }}>
            <option value="">All Actions</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>User #{item.userId}</td>
                <td><span className={`badge badge-action`}>{item.action}</span></td>
                <td>{item.entity}</td>
                <td className="truncate">{item.details}</td>
                <td>{item.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No audit logs found</div>}
      </div>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => load(p)} />
      {selected && <DetailModal title="Audit Log Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onDelete={handleDelete} />}
    </div>
  );
}
