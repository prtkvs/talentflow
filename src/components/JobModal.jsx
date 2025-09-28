import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const JobModal = ({ job, onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      title: job?.title || '',
      tags: job?.tags?.join(', ') || '',
      status: job?.status || 'active'
    }
  });

  const watchedTitle = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !job) {
      const slug = watchedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [watchedTitle, job, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      const jobData = {
        title: data.title,
        tags,
        status: data.status
      };

      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save job');
      }

      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Job Title *
            </label>
            <input
              id="title"
              type="text"
              className={`form-input ${errors.title ? 'border-red-500' : ''}`}
              {...register('title', { 
                required: 'Job title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters'
                }
              })}
              placeholder="Enter job title"
            />
            {errors.title && (
              <div className="error-message">{errors.title.message}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              className="form-input"
              {...register('tags')}
              placeholder="Enter tags separated by commas (e.g., React, JavaScript, Remote)"
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Separate multiple tags with commas
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="form-input form-select"
              {...register('status')}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {!job && (
            <div className="form-group">
              <label className="form-label" htmlFor="slug">
                URL Slug
              </label>
              <input
                id="slug"
                type="text"
                className="form-input"
                {...register('slug', {
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Slug can only contain lowercase letters, numbers, and hyphens'
                  }
                })}
                placeholder="auto-generated-from-title"
              />
              {errors.slug && (
                <div className="error-message">{errors.slug.message}</div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                This will be used in the job URL: /jobs/{watchedTitle?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'job-slug'}
              </div>
            </div>
          )}

          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#991b1b', 
              padding: '0.75rem', 
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }}></div>
                  Saving...
                </>
              ) : (
                job ? 'Update Job' : 'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
