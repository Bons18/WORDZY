import { useState } from 'react';

export function useToggleCourseProgrammingStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleStatus = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/course-programming/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar el estado');
      }
      
      return data;
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
}