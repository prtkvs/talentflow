import { useState } from 'react';

export const useJobReorder = () => {
  const [isReordering, setIsReordering] = useState(false);

  const reorderJobs = async (jobId, fromOrder, toOrder) => {
    setIsReordering(true);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromOrder,
          toOrder
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder jobs');
      }

      return await response.json();
    } catch (error) {
      console.error('Reorder failed:', error);
      throw error;
    } finally {
      setIsReordering(false);
    }
  };

  return {
    reorderJobs,
    isReordering
  };
};
