import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAssessment } from '../hooks/useAssessment';

const AssessmentRuntime = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [conditionalQuestions, setConditionalQuestions] = useState({});

  const { assessment, loading, error } = useAssessment(jobId);

  const { register, handleSubmit, watch, formState: { errors }, getValues } = useForm();
  const watchedValues = watch();

  // Handle conditional logic
  useEffect(() => {
    if (!assessment?.sections) return;

    const newConditionalQuestions = {};

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.conditional) {
          const { dependsOn, condition, value } = question.conditional;
          const dependentValue = getValues(dependsOn);

          let shouldShow = false;
          if (condition === 'equals') shouldShow = dependentValue === value;
          else if (condition === 'not_equals') shouldShow = dependentValue !== value;
          else if (condition === 'contains') shouldShow = Array.isArray(dependentValue) && dependentValue.includes(value);

          newConditionalQuestions[question.id] = shouldShow;
        } else {
          newConditionalQuestions[question.id] = true;
        }
      });
    });

    setConditionalQuestions(newConditionalQuestions);
  }, [watchedValues, assessment, getValues]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/assessments/${jobId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: 1, // Replace with actual auth
          responses: data
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assessment');
      }

      alert('Assessment submitted successfully!');
      navigate(`/jobs/${jobId}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateField = (question, value) => {
    if (question.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    if (question.type === 'numeric' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'Please enter a valid number';
      if (question.min !== undefined && numValue < question.min) return `Value must be at least ${question.min}`;
      if (question.max !== undefined && numValue > question.max) return `Value must be at most ${question.max}`;
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && value && question.maxLength && value.length > question.maxLength) {
      return `Text must be no more than ${question.maxLength} characters`;
    }

    return true;
  };

  const renderQuestion = (question, sectionIndex, questionIndex) => {
    if (!conditionalQuestions[question.id]) return null;

    const fieldName = `q_${sectionIndex}_${questionIndex}`;
    const error = errors[fieldName];

    return (
      <div key={question.id} style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
          {question.text}{question.required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
        </label>

        {question.type === 'short-text' && (
          <input
            type="text"
            className={`form-input ${error ? 'border-red-500' : ''}`}
            {...register(fieldName, { required: question.required, validate: value => validateField(question, value) })}
            placeholder="Enter your answer..."
          />
        )}

        {question.type === 'long-text' && (
          <textarea
            className={`form-input form-textarea ${error ? 'border-red-500' : ''}`}
            {...register(fieldName, { required: question.required, validate: value => validateField(question, value) })}
            placeholder="Enter your answer..."
            rows={4}
          />
        )}

        {question.type === 'numeric' && (
          <input
            type="number"
            className={`form-input ${error ? 'border-red-500' : ''}`}
            {...register(fieldName, { required: question.required, validate: value => validateField(question, value) })}
            placeholder="Enter a number..."
            min={question.min}
            max={question.max}
          />
        )}

        {question.type === 'single-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options?.map(option => (
              <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  value={option.value}
                  {...register(fieldName, { required: question.required, validate: value => validateField(question, value) })}
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'multi-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options?.map(option => (
              <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  value={option.value}
                  {...register(fieldName, { validate: value => validateField(question, value) })}
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'file-upload' && (
          <div style={{ border: '2px dashed #d1d5db', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb' }}>
            <input
              type="file"
              {...register(fieldName, { required: question.required, validate: value => validateField(question, value) })}
              style={{ display: 'none' }}
              id={`file-${fieldName}`}
            />
            <label htmlFor={`file-${fieldName}`} style={{ cursor: 'pointer', display: 'block', color: '#6b7280' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📁</div>
              <div>Click to upload file or drag and drop</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>PDF, DOC, DOCX up to 10MB</div>
            </label>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    );
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

  if (error || !assessment) {
    return (
      <div className="container">
        <div className="page-header">
          <button onClick={() => navigate(`/jobs/${jobId}`)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
            ← Back to Job
          </button>
          <h1 className="page-title">Assessment Not Found</h1>
          <p className="page-subtitle">Assessments are seeded into IndexedDB for demo purposes and may not be available for this job in production</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <button onClick={() => navigate(`/jobs/${jobId}`)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          ← Back to Job
        </button>
        <h1 className="page-title">{assessment.title}</h1>
        <p className="page-subtitle">Complete this assessment to apply for the position</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2rem' }}>
          <div className="lg:col-span-2">
            {assessment.sections.map((section, sectionIndex) => (
              <div key={section.id} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                  Section {sectionIndex + 1}: {section.title}
                </h3>

                {section.description && (
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    {section.description}
                  </p>
                )}

                {section.questions.map((question, questionIndex) => renderQuestion(question, sectionIndex, questionIndex))}
              </div>
            ))}

            {submitError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => navigate(`/jobs/${jobId}`)} className="btn btn-outline" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }}></div>
                    Submitting...
                  </>
                ) : 'Submit Assessment'}
              </button>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Assessment Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {assessment.sections.map((section, index) => (
                  <div key={section.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: index === currentSection ? '#dbeafe' : '#f8fafc', borderRadius: '0.375rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: index === currentSection ? '#3b82f6' : '#6b7280' }}></div>
                    <span style={{ fontSize: '0.875rem' }}>Section {index + 1}: {section.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssessmentRuntime;
