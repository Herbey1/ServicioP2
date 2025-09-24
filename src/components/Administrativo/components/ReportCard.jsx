"use client"

import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"

/**
 * Tarjeta resumen de reporte (versión Administrador).
 */
export default function ReportCard({ reporte, onReviewClick }) {
  const { darkMode } = useTheme();  /* Badge según estado */
  const badge = darkMode ? {
    Aprobado   : "bg-green-900 text-green-100",
    Rechazado  : "bg-red-900 text-red-100",
    Devuelto   : "bg-yellow-900 text-yellow-100",
    "En revisión": "bg-blue-900 text-blue-100"
  }[reporte.status] || "bg-gray-700 text-gray-100" : {
    Aprobado   : "bg-green-100 text-green-800",
    Rechazado  : "bg-red-100 text-red-800",
    Devuelto   : "bg-yellow-100 text-yellow-800",
    "En revisión": "bg-blue-100 text-blue-800"
  }[reporte.status] || "bg-gray-100 text-gray-800"
  return (
    <div className={`rounded-lg shadow hover:shadow-md transition-shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Encabezado */}
      <div className={`px-4 py-2 border-b flex justify-between items-center ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`font-medium truncate flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{reporte.solicitante}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge}`}>
          {reporte.status}
        </span>
      </div>      {/* Cuerpo */}
      <div className="p-4">
        <h2 className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reporte.titulo}</h2>

        <div className="text-sm mb-3">
          <span className={`mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Entregado:</span>
          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{reporte.fechaEntrega}</span>
        </div>

        {/* Resumen de historial */}
        <div className={`mt-2 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {(reporte.ultimoCambioFecha || reporte.ultimoCambioActor) && (
            <div className="mb-1">
              <span className="font-medium">Último cambio:</span>
              <span> {reporte.ultimoCambioFecha || '—'}</span>
              {reporte.ultimoCambioActor && <span> • por {reporte.ultimoCambioActor}</span>}
            </div>
          )}
          {typeof reporte.historialCount === 'number' && (
            <div>
              <span className="font-medium">Historial:</span>
              <span> {reporte.historialCount} evento{reporte.historialCount === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>

        {reporte.comentariosAdmin && (
          <div className={`mb-3 p-2 rounded-md text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Comentarios:</p>
            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{reporte.comentariosAdmin}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onReviewClick}
            className="inline-flex items-center px-3 py-1.5 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800"
          >
            {reporte.status === "En revisión" ? "Revisar" : "Ver detalles"}
          </button>
        </div>
      </div>
    </div>
  )
}

ReportCard.propTypes = {
  reporte: PropTypes.object.isRequired,
  onReviewClick: PropTypes.func.isRequired
}
