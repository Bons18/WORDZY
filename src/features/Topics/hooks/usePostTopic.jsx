import { useState } from "react";

export function usePostTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postTopic = async (newTopic) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTopic),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al crear el tema");
      }

      const data = await response.json();
      return data; // devuelve el tema creado
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postTopic, loading, error };
}
