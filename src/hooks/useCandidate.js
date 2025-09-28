import { useState, useEffect, useCallback } from 'react';

export const useCandidate = (candidateId) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCandidate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      
      if (!response.ok) {
        throw new Error('Candidate not found');
      }

      const data = await response.json();
      setCandidate(data);
    } catch (err) {
      setError(err.message);
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    if (candidateId) {
      fetchCandidate();
    }
  }, [fetchCandidate, candidateId]);

  const refetch = useCallback(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  return {
    candidate,
    loading,
    error,
    refetch
  };
};
