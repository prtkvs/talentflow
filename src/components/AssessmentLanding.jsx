import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';

const AssessmentLanding = () => {
  // useJobs will now never crash because we gave it defaults
  const { jobs, loading, error } = useJobs();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Loading jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Error loading jobs</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No jobs available</h2>
        <p>Please add jobs first before managing or taking assessments.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 className="page-header">Assessments</h1>

      <div className="job-list">
        {jobs.map((job) => (
          <div key={job.id} className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            <h3>{job.title}</h3>
            <p>{job.description || 'No description available'}</p>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              {/* Manage Assessment */}
              <Link to={`/jobs/${job.id}/assessment`} className="btn btn-outline">
                Manage Assessment
              </Link>

              {/* Take Assessment */}
              <Link to={`/jobs/${job.id}/assessment/take`} className="btn btn-primary">
                Take Assessment
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentLanding;
