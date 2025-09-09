import { useEffect, useState, useCallback } from "react";

export function useGetCourseProgrammings() {
  const [programmings, setProgrammings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgrammings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/course-programming");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener las programaciones");
      }

      setProgrammings(data || []);
    } catch (err) {
      setError(err.message || "Error desconocido al obtener las programaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgrammings();
  }, [fetchProgrammings]);

  return { programmings, loading, error, refetch: fetchProgrammings };
}