import { useState } from "react";

export function usePutCourseProgramming() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const putCourseProgramming = async (id, programmingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/course-programming/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programmingData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al actualizar la programación");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { putCourseProgramming, loading, error };
}