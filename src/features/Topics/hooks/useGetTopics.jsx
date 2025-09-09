import { useEffect, useState, useCallback } from "react";

export function useGetTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/topic");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener los temas");
      }

      setTopics(data || []);
    } catch (err) {
      setError(err.message || "Error desconocido al obtener los temas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return { topics, loading, error, refetch: fetchTopics };
}
