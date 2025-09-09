import { useState } from "react";

export function useDeleteCourseProgramming() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteCourseProgramming = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/course-programming/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al eliminar la programación");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCourseProgramming, loading, error };
}