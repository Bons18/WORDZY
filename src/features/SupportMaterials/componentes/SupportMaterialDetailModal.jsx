"use client";

import { formatDate } from "../../../shared/utils/dateFormatter";

const SupportMaterialDetailModal = ({ isOpen, onClose, material }) => {
  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1f384c]">
            Detalle de material de apoyo
          </h2>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-[#627b87] mb-1">
                Título:
              </label>
              <div className="px-3 py-2 border border-[#d9d9d9] rounded bg-[#f6f6fb]">
                {material.titulo || material.nombre}
              </div>
            </div>
            {/* <div>
              <label className="block text-sm text-[#627b87] mb-1">Tema:</label>
              <div className="px-3 py-2 border border-[#d9d9d9] rounded bg-[#f6f6fb]">{material.tema}</div>
            </div> */}
            <div>
              <label className="block text-sm text-[#627b87] mb-1">
                Fecha:
              </label>
              <div className="px-3 py-2 border border-[#d9d9d9] rounded bg-[#f6f6fb]">
                {material.fecha_creacion
                  ? formatDate(material.fecha_creacion)
                  : "Sin fecha"}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#627b87] mb-1">
                Estado:
              </label>
              <div className="px-3 py-2 border border-[#d9d9d9] rounded bg-[#f6f6fb]">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    material.estado.toLowerCase() === "activo"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {material.estado.charAt(0).toUpperCase() +
                    material.estado.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-[#627b87] mb-1">
              Contenido:
            </label>
            <div className="border border-[#d9d9d9] rounded bg-white">
              <div className="p-4 min-h-[300px] overflow-auto">
                <div
                  className="text-sm text-[#627b87] editor-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      material.contenido || "<div>Material de Apoyo...</div>",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="p-6 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            className="px-6 py-2 bg-[#dc3545] text-white rounded-lg hover:bg-red-600 transition-colors"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportMaterialDetailModal;
