import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssessment } from '../hooks/useAssessment';
import AssessmentPreview from './AssessmentPreview';
import QuestionBuilder from './QuestionBuilder';

const AssessmentBuilder = () => {
  const { jobId } = useParams();
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { assessment, loading, error, refetch } = useAssessment(jobId);

  const [localAssessment, setLocalAssessment] = useState({
    title: '',
    sections: []
  });

  useEffect(() => {
    if (assessment) {
      setLocalAssessment(assessment);
    } else {
      setLocalAssessment({
        title: `Assessment for Job #${jobId}`,
        sections: []
      });
    }
  }, [assessment, jobId]);

  const addSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      description: '',
      questions: [],
      order: localAssessment.sections.length
    };
    
    setLocalAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    
    setSelectedSection(newSection.id);
  };

  const updateSection = (sectionId, updates) => {
    setLocalAssessment(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId) => {
    setLocalAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
    
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const addQuestion = (sectionId) => {
    const section = localAssessment.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newQuestion = {
      id: `q_${Date.now()}`,
      type: 'short-text',
      text: 'New Question',
      required: false,
      order: section.questions.length
    };

    updateSection(sectionId, {
      questions: [...section.questions, newQuestion]
    });
    
    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    const section = localAssessment.sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      questions: section.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  const deleteQuestion = (sectionId, questionId) => {
    const section = localAssessment.sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      questions: section.questions.filter(q => q.id !== questionId)
    });
    
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null);
    }
  };

  const saveAssessment = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/assessments/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localAssessment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assessment');
      }

      await refetch();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <span style={{ marginLeft: '1rem' }}>Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="page-header">
          <Link to={`/jobs/${jobId}`} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
            ← Back to Job
          </Link>
          <h1 className="page-title">Error Loading Assessment</h1>
          <p className="page-subtitle">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <Link to={`/jobs/${jobId}`} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          ← Back to Job
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Assessment Builder</h1>
            <p className="page-subtitle">Create and customize the assessment for this job</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={saveAssessment}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save Assessment'}
            </button>
          </div>
        </div>
      </div>

      {saveError && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          padding: '0.75rem', 
          borderRadius: '0.375rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2rem' }}>
        <div className="lg:col-span-2">
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Assessment Title</h3>
            </div>
            <input
              type="text"
              className="form-input"
              value={localAssessment.title}
              onChange={(e) => setLocalAssessment(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter assessment title"
            />
          </div>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Sections</h3>
              <button onClick={addSection} className="btn btn-primary">
                + Add Section
              </button>
            </div>

            {localAssessment.sections.length === 0 ? (
              <div className="empty-state">
                <h3>No sections yet</h3>
                <p>Add your first section to start building the assessment</p>
                <button onClick={addSection} className="btn btn-primary">
                  Add Section
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {localAssessment.sections.map((section, index) => (
                  <div key={section.id} className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                        Section {index + 1}: {section.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSelectedSection(section.id)}
                          className={`btn ${selectedSection === section.id ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {section.description && (
                      <p style={{ margin: '0 0 0.75rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        {section.description}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => addQuestion(section.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        + Add Question
                      </button>
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
              Live Preview
            </h3>
            <AssessmentPreview assessment={localAssessment} />
          </div>

          {selectedSection && localAssessment.sections.find(s => s.id === selectedSection) && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Section Editor
              </h3>
              <QuestionBuilder
                section={localAssessment.sections.find(s => s.id === selectedSection)}
                onUpdate={(updates) => updateSection(selectedSection, updates)}
                selectedQuestion={selectedQuestion}
                onQuestionSelect={setSelectedQuestion}
                onQuestionUpdate={(questionId, updates) => updateQuestion(selectedSection, questionId, updates)}
                onQuestionDelete={(questionId) => deleteQuestion(selectedSection, questionId)}
                onAddQuestion={() => addQuestion(selectedSection)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentBuilder;
