import React from 'react';
import { FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function DetailModal({ title, data, fields, onClose, onEdit, onDelete }) {
  if (!data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <div className="modal-actions">
            {onEdit && <button className="btn btn-primary btn-sm" onClick={() => onEdit(data)}><FiEdit2 /> Edit</button>}
            {onDelete && <button className="btn btn-danger btn-sm" onClick={() => onDelete(data.id)}><FiTrash2 /> Delete</button>}
            <button className="btn-close" onClick={onClose}><FiX /></button>
          </div>
        </div>
        <div className="modal-body">
          {fields.map((field) => (
            <div key={field.key} className="detail-row">
              <span className="detail-label">{field.label}</span>
              <span className={`detail-value ${field.className || ''}`}>
                {field.render ? field.render(data[field.key], data) : (data[field.key] ?? 'N/A')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
