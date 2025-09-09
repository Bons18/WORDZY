"use client"

import React from "react"
import {
  FiSearch,
  FiEdit,
  FiTrash,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiDownload
} from "react-icons/fi"
import { MdAddCircleOutline } from "react-icons/md"
import Tooltip from "../components/Tooltip"

const GenericTable = ({
  data = [],
  columns = [],
  onAdd,
  onShow,
  onEdit,
  onDelete,
  defaultItemsPerPage = 8,
  showActions = { show: false, edit: true, delete: true, add: true },
  tooltipText = "Ver detalle",
  showSearch = true,
  showPagination = true,
  exportToExcel = { enabled: false, filename: "datos", exportFunction: null },
}) => {
  // State management
  const [searchTerm, setSearchTerm] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage] = React.useState(defaultItemsPerPage)

  // Helper function to extract text from React elements
  const extractTextFromElement = (element) => {
    if (typeof element === 'string' || typeof element === 'number') {
      return String(element)
    }
    
    if (React.isValidElement(element)) {
      if (element.props && element.props.children) {
        if (Array.isArray(element.props.children)) {
          return element.props.children.map(extractTextFromElement).join(' ')
        }
        return extractTextFromElement(element.props.children)
      }
    }
    
    return String(element || '')
  }

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!showSearch) return data

    return data.filter(item =>
      columns.some(column => {
        let searchValue = ''
        
        if (column.render) {
          // Extraer el texto del componente renderizado
          const rendered = column.render(item)
          searchValue = extractTextFromElement(rendered)
        } else {
          searchValue = String(item[column.key] ?? '')
        }
        
        return searchValue.toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, showSearch, columns])

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

  const handleExportToExcel = () => {
    exportToExcel.exportFunction?.(filteredData)
  }

  // Render helpers
  const renderTableHeader = () => (
    <thead>
      <tr className="border-b border-gray-200">
        {columns.map((column) => (
          <th
            key={`header-${column.key}`}
            className="px-2 py-2 text-left text-sm font-semibold text-gray-600 truncate"
            style={{ width: column.width || "auto" }}
          >
            {column.label}
          </th>
        ))}
        {(showActions.show || showActions.edit || showActions.delete) && (
          <th className="px-2 py-2 text-center text-sm font-semibold text-gray-600 w-28">
            Acciones
          </th>
        )}
      </tr>
    </thead>
  )

  const renderTableBody = () => (
    <tbody>
      {currentData.length > 0 ? (
        currentData.map((item) => (
          <tr key={`row-${item._id || item.id}`} className="hover:bg-gray-50">
            {columns.map((column) => (
              <td
                key={`cell-${item._id || item.id}-${column.key}`}
                className="px-2 py-2 text-sm text-left border-b border-gray-200 text-gray-700 truncate"
                title={column.render ? String(column.render(item)) : String(item[column.key] ?? '')}
              >
                {column.render ? column.render(item) : (item[column.key] ?? '')}
              </td>
            ))}
            {renderActionButtons(item)}
          </tr>
        ))
      ) : (
        <>
          <tr>
            <td
              colSpan={columns.length + (showActions ? 1 : 0)}
              className="py-4 text-center text-gray-500 text-sm"
            >
              No se encontraron datos
            </td>
          </tr>
          <tr>
            <td
              colSpan={columns.length + (showActions ? 1 : 0)}
              className="border-b border-gray-200"
            ></td>
          </tr>
        </>
      )}
    </tbody>
  )

  const renderActionButtons = (item) => {
    if (!showActions.show && !showActions.edit && !showActions.delete) return null

    return (
      <td className="px-2 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 justify-center">
          {showActions.show && (
            <Tooltip text={tooltipText} position="top">
              <button
                onClick={() => onShow?.(item)}
                className="p-1.5 text-white rounded-lg transition-colors"
                style={{ backgroundColor: "#1F384C" }}
                aria-label="Detalle"
              >
                <FiEye size={15} />
              </button>
            </Tooltip>
          )}
          {showActions.edit && (
            <Tooltip text="Editar" position="top">
              <button
                onClick={() => onEdit?.(item)}
                className="p-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                aria-label="Editar"
              >
                <FiEdit size={15} />
              </button>
            </Tooltip>
          )}
          {showActions.delete && (
            <Tooltip text="Eliminar" position="top">
              <button
                onClick={() => onDelete?.(item._id || item.id)}
                className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                aria-label="Eliminar"
              >
                <FiTrash size={15} />
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
      <div className="flex justify-between items-center text-xs text-gray-600">
        <div>{filteredData.length} elementos</div>
        <div className="flex items-center gap-2">
          <span>
            Página {currentPage} de {Math.max(1, totalPages)}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              aria-label="Página anterior"
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || filteredData.length === 0}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              aria-label="Página siguiente"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[10px] shadow-sm p-2 flex flex-col min-h-0">
      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-3 pr-8 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
              />
              <FiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          )}

          {exportToExcel.enabled && (
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload size={16} />
              <span>Exportar a Excel</span>
            </button>
          )}
        </div>

        {showActions.add && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-green-600"
          >
            <MdAddCircleOutline size={16} />
            <span>Añadir</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mb-3 min-h-0 overflow-visible">
        <table className="w-full table-fixed">
          {renderTableHeader()}
          {renderTableBody()}
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
}

export default GenericTable