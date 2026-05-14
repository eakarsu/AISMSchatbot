import React, { useRef, useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

export default function FileUpload({ onFileSelect, accept, label = 'Attach File' }) {
  const inputRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelected(file);
      onFileSelect(file);
    }
  };

  const handleClear = () => {
    setSelected(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        type="file"
        accept={accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt'}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {selected ? (
        <div className="file-selected">
          <FiFile />
          <span>{selected.name}</span>
          <span className="file-size">({(selected.size / 1024).toFixed(1)} KB)</span>
          <button type="button" className="btn-icon" onClick={handleClear}>
            <FiX />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => inputRef.current?.click()}
        >
          <FiUpload /> {label}
        </button>
      )}
    </div>
  );
}
