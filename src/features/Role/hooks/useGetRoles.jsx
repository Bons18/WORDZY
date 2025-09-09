import { useEffect, useCallback, useState } from "react";

export function useGetRoles() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:3000/api/role", {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al obtener los roles");
            }
    
            // Actualiza el estado y DEVUELVE los datos
            setRoles(data || []);
            return data; // Esto es importante
        } catch (err) {
            setError(err.message || "Error desconocido al obtener los roles");
            throw err; // Re-lanza el error para que pueda ser capturado fuera
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    return { roles, loading, error, refetch: fetchRoles };
}