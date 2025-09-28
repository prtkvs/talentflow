import { useState, useEffect, useCallback } from 'react';

export const useCandidates = (filters, pagination, jobId = null) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        search: filters.search || '',
        stage: filters.stage || '',
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString()
      });

      if (jobId) {
        params.append('jobId', jobId);
      }

      const response = await fetch(`/api/candidates?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data.data);
      setPaginationData(data.pagination);
    } catch (err) {
      setError(err.message);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, jobId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const refetch = useCallback(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    candidates,
    loading,
    error,
    pagination: paginationData,
    refetch
  };
};
