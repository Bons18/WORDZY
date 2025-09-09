"use client"
import { AlertCircle } from "lucide-react"

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
      <p className="text-red-600 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
