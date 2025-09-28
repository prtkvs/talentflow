import React from 'react';

const QuestionBuilder = ({ 
  section, 
  onUpdate, 
  selectedQuestion, 
  onQuestionSelect, 
  onQuestionUpdate, 
  onQuestionDelete, 
  onAddQuestion 
}) => {

  const questionTypes = [
    { value: 'short-text', label: 'Short Text' },
    { value: 'long-text', label: 'Long Text' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'single-choice', label: 'Single Choice' },
    { value: 'multi-choice', label: 'Multiple Choice' },
    { value: 'file-upload', label: 'File Upload' }
  ];

  const updateQuestion = (questionId, updates) => {
    onQuestionUpdate(questionId, updates);
  };

  const addOption = (questionId) => {
    const question = section.questions.find(q => q.id === questionId);
    if (!question) return;

    const newOption = {
      id: `opt_${Date.now()}`,
      text: 'New Option',
      value: `option_${question.options?.length || 0}`
    };

    updateQuestion(questionId, {
      options: [...(question.options || []), newOption]
    });
  };

  const updateOption = (questionId, optionId, updates) => {
    const question = section.questions.find(q => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      options: question.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const deleteOption = (questionId, optionId) => {
    const question = section.questions.find(q => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" htmlFor="section-title">
          Section Title
        </label>
        <input
          id="section-title"
          type="text"
          className="form-input"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter section title"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" htmlFor="section-description">
          Section Description
        </label>
        <textarea
          id="section-description"
          className="form-input form-textarea"
          value={section.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter section description (optional)"
          rows={2}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>Questions</h4>
          <button onClick={onAddQuestion} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
            + Add Question
          </button>
        </div>

        {section.questions.length === 0 ? (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#6b7280',
            backgroundColor: '#f8fafc',
            borderRadius: '0.375rem',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ margin: 0 }}>No questions yet</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Add your first question</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {section.questions.map((question, index) => (
              <div key={question.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Question {index + 1}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        backgroundColor: '#f1f5f9',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}>
                        {questionTypes.find(t => t.value === question.type)?.label || question.type}
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Enter question text"
                      style={{ marginBottom: '0.5rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => onQuestionSelect(question.id)}
                      className={`btn ${selectedQuestion === question.id ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onQuestionDelete(question.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  
                  <select
                    className="form-input form-select"
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                    style={{ width: 'auto', minWidth: '120px' }}
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedQuestion === question.id && (
                  <div style={{ 
                    borderTop: '1px solid #e5e7eb', 
                    paddingTop: '0.75rem',
                    marginTop: '0.75rem'
                  }}>
                    {renderQuestionEditor(question, updateQuestion, addOption, updateOption, deleteOption)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const renderQuestionEditor = (question, updateQuestion, addOption, updateOption, deleteOption) => {
  switch (question.type) {
    case 'numeric':
      return (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="min-value">
              Minimum Value
            </label>
            <input
              id="min-value"
              type="number"
              className="form-input"
              value={question.min || ''}
              onChange={(e) => updateQuestion(question.id, { min: parseInt(e.target.value) || undefined })}
              placeholder="Min value"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="max-value">
              Maximum Value
            </label>
            <input
              id="max-value"
              type="number"
              className="form-input"
              value={question.max || ''}
              onChange={(e) => updateQuestion(question.id, { max: parseInt(e.target.value) || undefined })}
              placeholder="Max value"
            />
          </div>
        </div>
      );

    case 'short-text':
    case 'long-text':
      return (
        <div>
          <label className="form-label" htmlFor="max-length">
            Maximum Length
          </label>
          <input
            id="max-length"
            type="number"
            className="form-input"
            value={question.maxLength || ''}
            onChange={(e) => updateQuestion(question.id, { maxLength: parseInt(e.target.value) || undefined })}
            placeholder="Max characters"
          />
        </div>
      );

    case 'single-choice':
    case 'multi-choice':
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Options
            </label>
            <button
              onClick={() => addOption(question.id)}
              className="btn btn-primary"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
            >
              + Add Option
            </button>
          </div>
          
          {question.options?.length === 0 ? (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center', 
              color: '#6b7280',
              backgroundColor: '#f8fafc',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ margin: 0 }}>No options yet</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Add options for this question</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {question.options?.map((option, index) => (
                <div key={option.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={option.text}
                    onChange={(e) => updateOption(question.id, option.id, { text: e.target.value })}
                    placeholder="Option text"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => deleteOption(question.id, option.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'file-upload':
      return (
        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            File upload questions don't require additional configuration.
          </p>
        </div>
      );

    default:
      return null;
  }
};

export default QuestionBuilder;
