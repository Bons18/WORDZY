import { useState, useEffect } from "react";
import supportMaterialService from "../services/supportMaterialService";

const useSupportMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportMaterialService.getAllMaterials();
      if (data && data.materials) {
        setMaterials(data.materials);
      } else if (Array.isArray(data)) {
        setMaterials(data);
      } else {
        setMaterials([]);
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      setError(error.message || "Failed to fetch materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const createMaterial = async (materialData) => {
    try {
      setLoading(true);
      setError(null);
      const newMaterial = await supportMaterialService.createMaterial(materialData);
      setMaterials((prevMaterials) => [...prevMaterials, newMaterial]);
      return newMaterial;
    } catch (error) {
      console.error("Error creating material:", error);
      setError(error.message || "Failed to create material");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMaterial = async (id, materialData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMaterial = await supportMaterialService.updateMaterial(id, materialData);
      setMaterials((prevMaterials) =>
        prevMaterials.map((material) => (material._id === id ? updatedMaterial : material)),
      );
    } catch (error) {
      console.error("Error updating material:", error);
      setError(error.message || "Failed to update material");
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await supportMaterialService.deleteMaterial(id);
      setMaterials((prevMaterials) => prevMaterials.filter((material) => material._id !== id));
      console.log("Material eliminado exitosamente de la base de datos");
    } catch (error) {
      console.error("Error al eliminar material:", error);
      setError(error.message || "Error al eliminar el material");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    materials,
    loading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    refetch: fetchMaterials, 
    setMaterials,
    setError,
  };
};

export default useSupportMaterials;
