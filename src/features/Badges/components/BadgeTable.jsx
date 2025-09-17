"use client"

import React from "react"
import {
  FiSearch,
  FiEdit,
  FiTrash,
  FiChevronLeft,
  FiChevronRight,
  FiEye
} from "react-icons/fi"
import { MdAddCircleOutline } from "react-icons/md"
import Tooltip from "../../../shared/components/Tooltip"

const BadgeTable = ({
  data = [],
  onAdd,
  onShow,
  onEdit,
  onDelete,
  defaultItemsPerPage = 5,
  showActions = { show: false, edit: true, delete: true, add: true },
  tooltipText = "Ver insignia",
  showSearch = true,
  showPagination = true,
  loading = false,
}) => {
  // State management
  const [searchTerm, setSearchTerm] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage] = React.useState(defaultItemsPerPage)

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!showSearch) return data

    return data.filter(item =>
      (item.name || item.badgeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.points || '').toString().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm, showSearch])

  // Pagination logic
  const { currentData, totalPages } = React.useMemo(() => {
    if (!showPagination) {
      return {
        currentData: filteredData,
        totalPages: 1
      }
    }

    return {
      currentData: filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
      totalPages: Math.ceil(filteredData.length / itemsPerPage) || 1
    }
  }, [filteredData, currentPage, itemsPerPage, showPagination])

  // Event handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)))
  }

  // Render helpers
  const renderBadgeImage = (badge) => {
    // Construir la URL completa de la imagen
    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      
      // Si es una sola letra (insignia por defecto), no mostrar imagen
      if (imagePath.length === 1) {
        return null;
      }
      
      // Si la imagen comienza con /uploads/, es una imagen personalizada
      if (imagePath.startsWith('/uploads/')) {
        return `http://localhost:3000${imagePath}`;
      }
      
      // Si la imagen comienza con /public/, es una imagen predefinida
      if (imagePath.startsWith('/public/')) {
        return `http://localhost:3000${imagePath}`;
      }
      
      // Para otras rutas, asumir que son URLs completas
      return imagePath;
    };

    const imageUrl = getImageUrl(badge.image);
    console.log('🔍 BADGE IMAGE - badge.image:', badge.image);
    console.log('🔍 BADGE IMAGE - imageUrl:', imageUrl);

    return (
      <div className="flex justify-center items-center">
        {imageUrl ? (
          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-gray-300 shadow-lg bg-white flex items-center justify-center">
            <img
              src={imageUrl}
              alt={badge.name || badge.badgeName}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('🔍 BADGE IMAGE - Error loading image:', imageUrl);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div
              className="w-full h-full rounded-full hidden items-center justify-center text-white text-lg font-bold bg-gray-500"
            >
              {(badge.name || badge.badgeName)?.charAt(0) || "?"}
            </div>
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-3 border-gray-300 shadow-lg bg-gray-500"
          >
            {(badge.name || badge.badgeName)?.charAt(0) || "?"}
          </div>
        )}
      </div>
    )
  }

  const renderTableHeader = () => (
    <thead>
      <tr className="border-b-2 border-gray-200 bg-gray-50">
        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">
          Imagen
        </th>
        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
          Nombre
        </th>
        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-24">
          Puntos
        </th>
        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-80">
          Descripción
        </th>
        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">
          Fecha Inicio
        </th>
        <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">
          Fecha Fin
        </th>
        {(showActions.show || showActions.edit || showActions.delete) && (
          <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">
            Acciones
          </th>
        )}
      </tr>
    </thead>
  )

  const renderTableBody = () => (
    <tbody>
      {loading ? (
        <tr>
          <td
            colSpan={7}
            className="py-12 text-center text-gray-500 text-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Cargando insignias...</span>
            </div>
          </td>
        </tr>
      ) : currentData.length > 0 ? (
        currentData.map((badge) => (
          <tr key={`badge-${badge._id || badge.id}`} className="hover:bg-gray-50 border-b border-gray-100">
            <td className="px-4 py-4 text-center">
              {renderBadgeImage(badge)}
            </td>
            <td className="px-4 py-4 text-left">
              <div className="font-medium text-gray-900">
                {badge.name || badge.badgeName || "N/A"}
              </div>
            </td>
            <td className="px-4 py-4 text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {badge.points || "N/A"}
              </span>
            </td>
            <td className="px-4 py-4 text-left">
              <div className="text-sm text-gray-600 max-w-md break-words max-h-20 overflow-y-auto" title={badge.description}>
                {badge.description || "Sin descripción"}
              </div>
            </td>
            <td className="px-4 py-4 text-center text-sm text-gray-600">
              {badge.startDate ? new Date(badge.startDate).toLocaleDateString('es-ES') : "N/A"}
            </td>
            <td className="px-4 py-4 text-center text-sm text-gray-600">
              {badge.endDate ? new Date(badge.endDate).toLocaleDateString('es-ES') : "N/A"}
            </td>
            {renderActionButtons(badge)}
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={7}
            className="py-12 text-center text-gray-500 text-sm"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <MdAddCircleOutline size={32} className="text-gray-400" />
              </div>
              <p>No se encontraron insignias</p>
              {showActions.add && (
                <button
                  onClick={onAdd}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Crear primera insignia
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  )

  const renderActionButtons = (badge) => {
    if (!showActions.show && !showActions.edit && !showActions.delete) return null

    return (
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 justify-center">
          {showActions.show && (
            <Tooltip text={tooltipText} position="top">
              <button
                onClick={() => onShow?.(badge)}
                className="p-2 text-white rounded-lg transition-colors hover:bg-gray-700"
                style={{ backgroundColor: "#1F384C" }}
                aria-label="Ver detalle"
              >
                <FiEye size={16} />
              </button>
            </Tooltip>
          )}
          {showActions.edit && (
            <Tooltip text="Editar" position="top">
              <button
                onClick={() => onEdit?.(badge)}
                className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                aria-label="Editar"
              >
                <FiEdit size={16} />
              </button>
            </Tooltip>
          )}
          {showActions.delete && (
            <Tooltip text="Eliminar" position="top">
              <button
                onClick={() => onDelete?.(badge._id || badge.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                aria-label="Eliminar"
              >
                <FiTrash size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </td>
    )
  }

  const renderPagination = () => {
    if (!showPagination) return null

    return (
      <div className="flex justify-between items-center mt-6 pt-6 px-6 pb-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 font-medium">
          Mostrando {currentData.length} de {filteredData.length} insignias
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Página {currentPage} de {Math.max(1, totalPages)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || filteredData.length === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Controls */}
      <div className="flex justify-between items-center p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar insignias..."
                className="w-80 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          )}
        </div>

        {showActions.add && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <MdAddCircleOutline size={20} />
            <span>Nueva Insignia</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {renderTableHeader()}
          {renderTableBody()}
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
}

export default BadgeTable