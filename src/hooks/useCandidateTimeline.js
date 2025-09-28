import { useState, useEffect, useCallback } from 'react';

export const useCandidateTimeline = (candidateId) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/candidates/${candidateId}/timeline`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }

      const data = await response.json();
      setTimeline(data);
    } catch (err) {
      setError(err.message);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (candidateId) {
      fetchTimeline();
    }
  }, [fetchTimeline, candidateId]);

  const refetch = useCallback(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    timeline,
    loading,
    error,
    refetch
  };
};
