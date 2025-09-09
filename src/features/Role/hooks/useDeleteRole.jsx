import { useState } from "react";

export function useDeleteRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRole = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("wordzy_token")
      const response = await fetch(`http://localhost:3000/api/role/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al eliminar el rol");
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteRole, loading, error };
}