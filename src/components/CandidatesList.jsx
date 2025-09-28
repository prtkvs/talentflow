import React, { useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import FiltersSection from './FiltersSection';
import Pagination from './Pagination';
import { useCandidates } from '../hooks/useCandidates';

const CandidateRow = ({ index, style, data }) => {
  const candidate = data.candidates[index];
  
  if (!candidate) {
    return (
      <div style={style}>
        <div className="card" style={{ padding: '1rem', margin: '0.5rem 0' }}>
          <div className="skeleton" style={{ height: '60px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={style}>
      <div className="card" style={{ padding: '1rem', margin: '0.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                <Link 
                  to={`/candidates/${candidate.id}`}
                  style={{ textDecoration: 'none', color: '#1e293b' }}
                >
                  {candidate.name}
                </Link>
              </h4>
              <span className={`status-badge status-${candidate.stage}`}>
                {candidate.stage}
              </span>
            </div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              {candidate.email}
            </p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.75rem' }}>
              Applied {format(new Date(candidate.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link 
              to={`/candidates/${candidate.id}`}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidatesList = ({ jobId }) => {
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    sort: 'createdAt'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20
  });

  const { 
    candidates, 
    loading, 
    error, 
    pagination: candidatesPagination,
    refetch 
  } = useCandidates(filters, pagination, jobId);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Error Loading Candidates</h3>
        <p>{error}</p>
        <button onClick={refetch} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
          Candidates
        </h2>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {candidatesPagination?.total || 0} total candidates
        </div>
      </div>

      <FiltersSection
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search candidates by name or email..."
        filterOptions={[
          { value: '', label: 'All Stages' },
          { value: 'applied', label: 'Applied' },
          { value: 'screen', label: 'Screen' },
          { value: 'tech', label: 'Technical' },
          { value: 'offer', label: 'Offer' },
          { value: 'hired', label: 'Hired' },
          { value: 'rejected', label: 'Rejected' }
        ]}
        sortOptions={[
          { value: 'createdAt', label: 'Newest First' },
          { value: 'name', label: 'Name A-Z' },
          { value: 'stage', label: 'Stage' }
        ]}
      />

      {loading ? (
        <div style={{ height: '400px' }}>
          <List
            height={400}
            itemCount={10}
            itemSize={80}
            itemData={{ candidates: [] }}
          >
            {CandidateRow}
          </List>
        </div>
      ) : candidates.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No candidates found</h3>
            <p>No candidates have applied to this job yet</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ height: '400px', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            <List
              height={400}
              itemCount={candidates.length}
              itemSize={80}
              itemData={{ candidates }}
            >
              {CandidateRow}
            </List>
          </div>

          {candidatesPagination && candidatesPagination.totalPages > 1 && (
            <Pagination
              currentPage={candidatesPagination.page}
              totalPages={candidatesPagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CandidatesList;
