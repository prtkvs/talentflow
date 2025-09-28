import { useState, useEffect, useCallback } from 'react';

export const useJobs = (filters, pagination) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        search: filters.search || '',
        status: filters.status || '',
        sort: filters.sort || 'order',
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString()
      });

      const response = await fetch(`/api/jobs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.data);
      setPaginationData(data.pagination);
    } catch (err) {
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const refetch = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    pagination: paginationData,
    refetch
  };
};
