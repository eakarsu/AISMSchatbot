import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

export default function FormModal({ title, fields, data, onSave, onClose }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      const defaults = {};
      fields.forEach((f) => { defaults[f.key] = f.defaultValue || ''; });
      setFormData(defaults);
    }
  }, [data, fields]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{data ? `Edit ${title}` : `New ${title}`}</h2>
          <button className="btn-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body form-body">
          {fields.map((field) => (
            <div key={field.key} className="form-group">
              <label>{field.label}{field.required && <span className="required">*</span>}</label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  rows={3}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  step={field.type === 'number' ? '0.01' : undefined}
                />
              )}
            </div>
          ))}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><FiSave /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
