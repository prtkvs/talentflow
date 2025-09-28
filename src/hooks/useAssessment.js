import { useState, useEffect, useCallback } from 'react';

export const useAssessment = (jobId) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessment');
      }

      const data = await response.json();
      setAssessment(data);
    } catch (err) {
      setError(err.message);
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchAssessment();
    }
  }, [fetchAssessment, jobId]);

  const refetch = useCallback(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  return {
    assessment,
    loading,
    error,
    refetch
  };
};
