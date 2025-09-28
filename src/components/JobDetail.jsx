import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import CandidatesList from './CandidatesList';

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const jobData = await response.json();
        setJob(jobData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <span style={{ marginLeft: '1rem' }}>Loading job details...</span>
        </div>
      </div>
    );
  }

if (error || !job) { 
  return (
    <div className="container">
      <div className="page-header">
        <Link to="/" className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          ← Back to Jobs
        </Link>
        <h1 className="page-title">Job Not Found</h1>
        <p className="page-subtitle">The job you're looking for doesn't exist</p>

        {/* Added buttons for assessments */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <Link 
            to={`/jobs/${jobId}/assessment`}
            className="btn btn-primary"
          >
            📝 Manage Assessment
          </Link>
          <Link 
            to={`/jobs/${jobId}/assessment/take`}
            className="btn btn-secondary"
          >
            📋 Take Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="container">
      <div className="page-header">
        <Link to="/" className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          ← Back to Jobs
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{job.title}</h1>
            <p className="page-subtitle">
              Created {format(new Date(job.createdAt), 'MMMM d, yyyy')} • 
              Last updated {format(new Date(job.updatedAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className={`status-badge status-${job.status}`}>
              {job.status}
            </span>
            <Link 
              to={`/jobs/${job.id}/assessment`}
              className="btn btn-primary"
              style={{ marginRight: '0.5rem' }}
            >
              Manage Assessment
            </Link>
            <Link 
              to={`/jobs/${job.id}/assessment/take`}
              className="btn btn-secondary"
            >
              Take Assessment
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2rem' }}>
        <div className="lg:col-span-2">
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Job Information
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  Job Title
                </label>
                <p style={{ margin: 0, color: '#1e293b' }}>{job.title}</p>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  URL Slug
                </label>
                <p style={{ margin: 0, color: '#6b7280', fontFamily: 'monospace' }}>
                  /jobs/{job.slug}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  Order Position
                </label>
                <p style={{ margin: 0, color: '#1e293b' }}>#{job.order}</p>
              </div>

              {job.tags && job.tags.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                    Tags
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {job.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '0.375rem',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <CandidatesList jobId={jobId} />
        </div>

        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link 
                to={`/jobs/${job.id}/assessment`}
                className="btn btn-primary"
                style={{ textAlign: 'center' }}
              >
                📝 Manage Assessment
              </Link>
              
              <Link 
                to={`/jobs/${job.id}/assessment/take`}
                className="btn btn-secondary"
                style={{ textAlign: 'center' }}
              >
                📋 Take Assessment
              </Link>
              
              <button 
                className="btn btn-outline"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/jobs/${job.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        status: job.status === 'active' ? 'archived' : 'active'
                      })
                    });
                    
                    if (response.ok) {
                      window.location.reload();
                    } else {
                      alert('Failed to update job status');
                    }
                  } catch (error) {
                    alert('Error updating job status');
                  }
                }}
              >
                {job.status === 'active' ? '📁 Archive Job' : '📂 Unarchive Job'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Job Statistics
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>0</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Applications</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>0</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Hired Candidates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
