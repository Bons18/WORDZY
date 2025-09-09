import { useState } from "react";

export function usePutTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const putTopic = async (id, topicData) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(`http://localhost:3000/api/topic/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(topicData)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Error al actualizar el tema");
    }

    return await response.json();
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};

  return { putTopic, loading, error };
}