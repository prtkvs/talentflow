import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const JobCard = ({ job, onEdit, isReordering }) => {
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(job);
  };

  const handleArchive = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: job.status === 'active' ? 'archived' : 'active'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  return (
    <div className={`card ${isReordering ? 'opacity-50' : ''}`} style={{ height: '100%' }}>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1e293b', 
              margin: '0 0 0.5rem 0',
              lineHeight: '1.4'
            }}>
              <Link 
                to={`/jobs/${job.id}`} 
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  display: 'block'
                }}
              >
                {job.title}
              </Link>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className={`status-badge status-${job.status}`}>
                {job.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Order: {job.order}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={handleEdit}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              title="Edit job"
            >
              ✏️
            </button>
            <button
              onClick={handleArchive}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              title={job.status === 'active' ? 'Archive job' : 'Unarchive job'}
            >
              {job.status === 'active' ? '📁' : '📂'}
            </button>
          </div>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {job.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    borderRadius: '0.25rem',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  +{job.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '0.75rem',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Created: {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
            <Link 
              to={`/jobs/${job.id}`}
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
