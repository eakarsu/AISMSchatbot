import React, { useState, useEffect } from 'react';
import { FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function DetailModal({ title, data, fields = [], onClose, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [localData, setLocalData] = useState(data || {});

  useEffect(() => {
    setLocalData(data || {});
    setEditing(false);
  }, [data]);

  if (!data) return null;

  const handleEdit = () => {
    if (onEdit) onEdit(localData);
    else setEditing(!editing);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(localData.id);
    else if (onClose) onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title || 'Details'}</h2>
          <div className="modal-actions">
            <button className="btn btn-primary btn-sm" onClick={handleEdit}><FiEdit2 /> {editing ? 'Save' : 'Edit'}</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}><FiTrash2 /> Delete</button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn-close" onClick={onClose}><FiX /></button>
          </div>
        </div>
        <div className="modal-body">
          {fields.map((field) => (
            <div key={field.key} className="detail-row">
              <span className="detail-label">{field.label}</span>
              <span className={`detail-value ${field.className || ''}`}>
                {editing ? (
                  <input
                    className="form-control"
                    value={localData[field.key] ?? ''}
                    onChange={(e) => setLocalData({ ...localData, [field.key]: e.target.value })}
                  />
                ) : (
                  field.render ? field.render(localData[field.key], localData) : (localData[field.key] ?? 'N/A')
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="btn btn-primary btn-sm" onClick={handleEdit}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
