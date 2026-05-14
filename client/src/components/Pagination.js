import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        className="btn btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        &laquo; Prev
      </button>
      {start > 1 && (
        <>
          <button className="btn btn-sm" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={`btn btn-sm ${p === page ? 'btn-primary' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
          <button className="btn btn-sm" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button
        className="btn btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next &raquo;
      </button>
      <span className="pagination-info">Page {page} of {totalPages}</span>
    </div>
  );
}
