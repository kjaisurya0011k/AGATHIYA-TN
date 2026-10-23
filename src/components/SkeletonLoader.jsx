import React from 'react';
import './SkeletonLoader.css';

export function SkeletonLoader({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="skeleton-grid" role="status" aria-label="Loading content...">
        {items.map((_, i) => (
          <div key={i} className="card skeleton-card">
            <div className="skeleton-line skeleton-badge" />
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text-short" />
            <div className="skeleton-footer">
              <div className="skeleton-avatar" />
              <div className="skeleton-btn" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table" role="status" aria-label="Loading table data...">
        {items.map((_, i) => (
          <div key={i} className="skeleton-row card">
            <div className="skeleton-line" style={{ width: '40%' }} />
            <div className="skeleton-line" style={{ width: '25%' }} />
            <div className="skeleton-line" style={{ width: '15%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-box" role="status" aria-label="Loading...">
      {items.map((_, i) => (
        <div key={i} className="skeleton-line" style={{ marginBottom: '0.75rem' }} />
      ))}
    </div>
  );
}

export default SkeletonLoader;
