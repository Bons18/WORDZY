"use client"

import { useRef, useEffect } from "react"
import { Search, Target, BookOpen } from "lucide-react"
import SearchInput from "./SearchInput"
import SearchResults from "./SearchResults"
import RecentFichas from "./RecentFichas"

const SearchView = ({
  searchTerm,
  searchResults,
  showSearchResults,
  isSearchLoading,
  recentFichas,
  onSearchChange,
  onSelectFicha,
  onClearRecentFichas,
  setShowSearchResults,
}) => {
  const searchContainerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setShowSearchResults])

  return (
    <div className="max-h-screen">
      <div className="max-w-10xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header sutil */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="bg-blue-50 p-2 rounded-lg mr-3 border border-blue-200">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Buscar Ficha</h1>
                <p className="text-gray-600 text-sm">Encuentra la ficha que necesitas gestionar</p>
              </div>
            </div>
          </div>

          {/* Tip box sutil - ACTUALIZADO con nueva funcionalidad */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <span className="font-medium">Tip:</span> Busca por número de ficha, nombre del programa o nombre del instructor.
            </p>
          </div>

          <div className="mb-6 relative" ref={searchContainerRef}>
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              onFocus={() => {
                if (searchTerm.trim() && searchResults.length > 0) {
                  setShowSearchResults(true)
                }
              }}
              placeholder="Ej: 2889955, María García, Desarrollo de Software..."
            />

            <SearchResults
              results={searchResults}
              searchTerm={searchTerm}
              onSelectFicha={onSelectFicha}
              isVisible={showSearchResults}
              isLoading={isSearchLoading}
            />
          </div>

          <RecentFichas fichas={recentFichas} onSelectFicha={onSelectFicha} onClearHistory={onClearRecentFichas} />
        </div>
      </div>
    </div>
  )
}

export default SearchView
