import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { useCandidate } from '../hooks/useCandidate';
import { useCandidateTimeline } from '../hooks/useCandidateTimeline';

const CandidateProfile = () => {
  const { id } = useParams();
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { candidate, loading: candidateLoading, error: candidateError, refetch: refetchCandidate } = useCandidate(id);
  const { timeline, loading: timelineLoading, refetch: refetchTimeline } = useCandidateTimeline(id);

  const stages = [
    { id: 'applied', name: 'Applied', color: '#3b82f6' },
    { id: 'screen', name: 'Screen', color: '#f59e0b' },
    { id: 'tech', name: 'Technical', color: '#8b5cf6' },
    { id: 'offer', name: 'Offer', color: '#10b981' },
    { id: 'hired', name: 'Hired', color: '#059669' },
    { id: 'rejected', name: 'Rejected', color: '#ef4444' }
  ];

  const handleStageChange = async (newStage) => {
    if (!candidate || candidate.stage === newStage) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: newStage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update candidate stage');
      }

      await refetchCandidate();
      await refetchTimeline();
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      alert('Failed to update candidate stage');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceStage = source.droppableId;
    const destinationStage = destination.droppableId;

    if (sourceStage !== destinationStage) {
      await handleStageChange(destinationStage);
    }
  };

  const handleAddNotes = async () => {
    if (!notes.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add notes');
      }

      setNotes('');
      setShowNotesModal(false);
      await refetchTimeline();
    } catch (error) {
      console.error('Error adding notes:', error);
      alert('Failed to add notes');
    } finally {
      setIsUpdating(false);
    }
  };

  if (candidateLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <span style={{ marginLeft: '1rem' }}>Loading candidate profile...</span>
        </div>
      </div>
    );
  }

  if (candidateError || !candidate) {
    return (
      <div className="container">
        <div className="page-header">
          <Link to="/candidates" className="btn btn-outline" style={{ marginBottom: '1rem' }}>
            ← Back to Candidates
          </Link>
          <h1 className="page-title">Candidate Not Found</h1>
          <p className="page-subtitle">The candidate you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/candidates" className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          ← Back to Candidates
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{candidate.name}</h1>
            <p className="page-subtitle">
              {candidate.email} • Applied {format(new Date(candidate.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className={`status-badge status-${candidate.stage}`}>
              {candidate.stage}
            </span>
            <button
              onClick={() => setShowNotesModal(true)}
              className="btn btn-primary"
            >
              Add Notes
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2rem' }}>
        <div className="lg:col-span-2">
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Candidate Information
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  Full Name
                </label>
                <p style={{ margin: 0, color: '#1e293b' }}>{candidate.name}</p>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  Email Address
                </label>
                <p style={{ margin: 0, color: '#1e293b' }}>
                  <a href={`mailto:${candidate.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {candidate.email}
                  </a>
                </p>
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                  Current Stage
                </label>
                <p style={{ margin: 0 }}>
                  <span className={`status-badge status-${candidate.stage}`}>
                    {candidate.stage}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Application Timeline
            </h3>
            {timelineLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                <span style={{ marginLeft: '1rem' }}>Loading timeline...</span>
              </div>
            ) : timeline.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                No timeline entries yet
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {timeline.map((entry, index) => (
                  <div key={entry.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: stages.find(s => s.id === entry.stage)?.color || '#6b7280',
                      marginTop: '0.25rem',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '500', color: '#1e293b' }}>
                          {stages.find(s => s.id === entry.stage)?.name || entry.stage}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {entry.notes && (
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Move Candidate
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Drag the candidate to a new stage or click a stage button
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={candidate.stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="kanban-card" style={{ 
                      backgroundColor: stages.find(s => s.id === candidate.stage)?.color || '#6b7280',
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {candidate.name}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stages.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  disabled={candidate.stage === stage.id || isUpdating}
                  className={`btn ${candidate.stage === stage.id ? 'active' : 'btn-outline'}`}
                  style={{ 
                    textAlign: 'left',
                    backgroundColor: candidate.stage === stage.id ? stage.color : undefined,
                    color: candidate.stage === stage.id ? 'white' : undefined,
                    borderColor: stage.color
                  }}
                >
                  {stage.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showNotesModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowNotesModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Add Notes</h2>
              <button
                onClick={() => setShowNotesModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                className="form-input form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this candidate..."
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowNotesModal(false)}
                className="btn btn-outline"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleAddNotes}
                className="btn btn-primary"
                disabled={!notes.trim() || isUpdating}
              >
                {isUpdating ? 'Adding...' : 'Add Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfile;
