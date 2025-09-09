import { useState } from "react";

export function usePostCourseProgramming() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postCourseProgramming = async (newProgramming) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/course-programming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProgramming),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al crear la programación");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postCourseProgramming, loading, error };
}