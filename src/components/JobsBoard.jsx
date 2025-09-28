import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import JobCard from './JobCard';
import JobModal from './JobModal';
import FiltersSection from './FiltersSection';
import Pagination from './Pagination';
import { useJobs } from '../hooks/useJobs';
import { useJobReorder } from '../hooks/useJobReorder';

const JobsBoard = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sort: 'order'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10
  });
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const { 
    jobs, 
    loading, 
    error, 
    pagination: jobsPagination,
    refetch 
  } = useJobs(filters, pagination);

  const { reorderJobs, isReordering } = useJobReorder();

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingJob(null);
  };

  const handleJobSaved = () => {
    refetch();
    handleModalClose();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    if (sourceIndex === destinationIndex) return;

    try {
      await reorderJobs(jobs[sourceIndex].id, sourceIndex + 1, destinationIndex + 1);
      refetch();
    } catch (error) {
      console.error('Failed to reorder jobs:', error);
      // The hook should handle rollback automatically
    }
  };

  if (error) {
    return (
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Jobs Board</h1>
          <p className="page-subtitle">Manage your job postings</p>
        </div>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button onClick={refetch} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Jobs Board</h1>
            <p className="page-subtitle">Manage your job postings and track applications</p>
          </div>
          <button onClick={handleCreateJob} className="btn btn-primary">
            + Create Job
          </button>
        </div>
      </div>

      <FiltersSection
        filters={filters}
        onFilterChange={handleFilterChange}
        searchPlaceholder="Search jobs by title or tags..."
        filterOptions={[
          { value: '', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' }
        ]}
        sortOptions={[
          { value: 'order', label: 'Custom Order' },
          { value: 'title', label: 'Title A-Z' },
          { value: 'createdAt', label: 'Newest First' }
        ]}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card skeleton skeleton-card"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>Create your first job posting to get started</p>
            <button onClick={handleCreateJob} className="btn btn-primary">
              Create Job
            </button>
          </div>
        </div>
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="jobs-board" direction="vertical">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                  style={{ minHeight: '200px' }}
                >
                  {jobs.map((job, index) => (
                    <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'dragging' : ''}
                        >
                          <JobCard
                            job={job}
                            onEdit={handleEditJob}
                            isReordering={isReordering}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {jobsPagination && (
            <Pagination
              currentPage={jobsPagination.page}
              totalPages={jobsPagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {showModal && (
        <JobModal
          job={editingJob}
          onClose={handleModalClose}
          onSave={handleJobSaved}
        />
      )}
    </div>
  );
};

export default JobsBoard;
