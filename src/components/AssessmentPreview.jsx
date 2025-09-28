import React from 'react';

const AssessmentPreview = ({ assessment }) => {
  if (!assessment || !assessment.sections || assessment.sections.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#6b7280',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <p>No sections to preview</p>
        <p style={{ fontSize: '0.875rem' }}>Add sections and questions to see the preview</p>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <h4 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        margin: '0 0 1rem 0',
        color: '#1e293b'
      }}>
        {assessment.title}
      </h4>

      {assessment.sections.map((section, sectionIndex) => (
        <div key={section.id} style={{ marginBottom: '2rem' }}>
          <h5 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            margin: '0 0 0.5rem 0',
            color: '#374151'
          }}>
            Section {sectionIndex + 1}: {section.title}
          </h5>
          
          {section.description && (
            <p style={{ 
              margin: '0 0 1rem 0', 
              color: '#6b7280', 
              fontSize: '0.875rem' 
            }}>
              {section.description}
            </p>
          )}

          {section.questions.map((question, questionIndex) => (
            <div key={question.id} style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <label style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#374151',
                  display: 'block'
                }}>
                  {questionIndex + 1}. {question.text}
                  {question.required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                </label>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  backgroundColor: '#f1f5f9',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {question.type}
                </span>
              </div>

              {renderQuestionPreview(question)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const renderQuestionPreview = (question) => {
  switch (question.type) {
    case 'short-text':
      return (
        <input
          type="text"
          className="form-input"
          placeholder="Enter your answer..."
          disabled
          style={{ backgroundColor: '#f9fafb' }}
        />
      );

    case 'long-text':
      return (
        <textarea
          className="form-input form-textarea"
          placeholder="Enter your answer..."
          disabled
          style={{ backgroundColor: '#f9fafb' }}
          rows={3}
        />
      );

    case 'numeric':
      return (
        <input
          type="number"
          className="form-input"
          placeholder="Enter a number..."
          disabled
          style={{ backgroundColor: '#f9fafb' }}
          min={question.min}
          max={question.max}
        />
      );

    case 'single-choice':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {question.options?.map((option, index) => (
            <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" disabled style={{ backgroundColor: '#f9fafb' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>{option.text}</span>
            </label>
          ))}
        </div>
      );

    case 'multi-choice':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {question.options?.map((option, index) => (
            <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" disabled style={{ backgroundColor: '#f9fafb' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>{option.text}</span>
            </label>
          ))}
        </div>
      );

    case 'file-upload':
      return (
        <div style={{ 
          border: '2px dashed #d1d5db',
          borderRadius: '0.375rem',
          padding: '1rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: 0 }}>Click to upload file or drag and drop</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>PDF, DOC, DOCX up to 10MB</p>
        </div>
      );

    default:
      return (
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '0.375rem',
          color: '#6b7280',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          Unknown question type: {question.type}
        </div>
      );
  }
};

export default AssessmentPreview;
