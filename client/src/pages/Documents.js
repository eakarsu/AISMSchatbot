import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiCpu, FiDownload } from 'react-icons/fi';
import DetailModal from '../components/DetailModal';
import FormModal from '../components/FormModal';
import AIResponseDisplay from '../components/AIResponseDisplay';
import Pagination from '../components/Pagination';
import FileUpload from '../components/FileUpload';

const docTypes = [
  { value: 'id_proof', label: 'ID Proof' }, { value: 'income_proof', label: 'Income Proof' },
  { value: 'address_proof', label: 'Address Proof' }, { value: 'employment_letter', label: 'Employment Letter' },
  { value: 'tax_return', label: 'Tax Return' }, { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'birth_certificate', label: 'Birth Certificate' }, { value: 'social_security', label: 'Social Security' },
  { value: 'medical_record', label: 'Medical Record' }, { value: 'other', label: 'Other' }
];

const formFields = [
  { key: 'applicantId', label: 'Applicant ID', type: 'number', required: true },
  { key: 'applicationId', label: 'Application ID', type: 'number' },
  { key: 'documentType', label: 'Document Type', type: 'select', required: true, options: docTypes },
  { key: 'fileName', label: 'File Name', required: true },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' }, { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }, { value: 'expired', label: 'Expired' }
  ]},
  { key: 'uploadDate', label: 'Upload Date', type: 'date' },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' }
];

const detailFields = [
  { key: 'id', label: 'ID' },
  { key: 'applicantId', label: 'Applicant', render: (v, d) => d.Applicant ? `${d.Applicant.firstName} ${d.Applicant.lastName}` : `ID: ${v}` },
  { key: 'documentType', label: 'Type', render: (v) => <span className="badge badge-info">{v?.replace('_', ' ')}</span> },
  { key: 'fileName', label: 'File Name' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge badge-${v}`}>{v}</span> },
  { key: 'uploadDate', label: 'Uploaded' },
  { key: 'expiryDate', label: 'Expires' },
  { key: 'notes', label: 'Notes' }
];

export default function Documents() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const load = useCallback((page = 1) => {
    api.get(`/documents?page=${page}&limit=20`)
      .then((r) => {
        if (Array.isArray(r.data)) { setItems(r.data); }
        else { setItems(r.data.data || []); setPagination(r.data.pagination || { page: 1, totalPages: 1 }); }
      })
      .catch(() => toast.error('Failed to load'));
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    try {
      if (pendingFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
        formData.append('file', pendingFile);
        if (editing) { await api.put(`/documents/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Updated!'); }
        else { await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Created!'); }
      } else {
        if (editing) { await api.put(`/documents/${editing.id}`, data); toast.success('Updated!'); }
        else { await api.post('/documents', data); toast.success('Created!'); }
      }
      setShowForm(false); setEditing(null); setPendingFile(null); load(pagination.page);
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const handleDownload = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/documents/${item.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = item.fileName || 'document'; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) { toast.error('Download failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try { await api.delete(`/documents/${id}`); toast.success('Deleted!'); setSelected(null); load(pagination.page); }
    catch (e) { toast.error('Error deleting'); }
  };

  const getAIReview = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/document-review', { documentType: 'all', programType: 'SNAP', applicantInfo: {} });
      setAiResult(res.data);
    } catch (e) { toast.error('AI service unavailable'); }
    setAiLoading(false);
  };

  const filtered = items.filter((i) => {
    const name = i.Applicant ? `${i.Applicant.firstName} ${i.Applicant.lastName}` : '';
    return `${name} ${i.documentType} ${i.fileName} ${i.status}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Documents</h1>
        <div className="page-actions">
          <div className="search-box"><FiSearch /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <button className="btn btn-secondary" onClick={getAIReview}><FiCpu /> AI Review</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setPendingFile(null); setShowForm(true); }}><FiPlus /> New Document</button>
        </div>
      </div>
      {(aiResult || aiLoading) && <AIResponseDisplay content={aiResult?.review} model={aiResult?.model} usage={aiResult?.usage} loading={aiLoading} title="Document Review Guide" />}
      {showForm && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary,#f9f9f9)', borderRadius: '8px', border: '1px solid var(--border,#ddd)' }}>
          <FileUpload label="Attach Document File (optional)" onFileSelect={setPendingFile} />
        </div>
      )}
      <div className="table-container">
        <table>
          <thead><tr><th>Applicant</th><th>Type</th><th>File</th><th>Status</th><th>Uploaded</th><th>Expires</th><th>File</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} onClick={() => setSelected(item)} className="clickable-row">
                <td><strong>{item.Applicant ? `${item.Applicant.firstName} ${item.Applicant.lastName}` : `#${item.applicantId}`}</strong></td>
                <td><span className="badge badge-info">{item.documentType?.replace('_', ' ')}</span></td>
                <td>{item.fileName}</td>
                <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                <td>{item.uploadDate}</td>
                <td>{item.expiryDate || '-'}</td>
                <td>
                  {item.filePath && (
                    <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); handleDownload(item); }}>
                      <FiDownload />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">No documents found</div>}
      </div>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => load(p)} />
      {selected && <DetailModal title="Document Details" data={selected} fields={detailFields} onClose={() => setSelected(null)} onEdit={(d) => { setEditing(d); setPendingFile(null); setShowForm(true); setSelected(null); }} onDelete={handleDelete} />}
      {showForm && <FormModal title="Document" fields={formFields} data={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); setPendingFile(null); }} />}
    </div>
  );
}
