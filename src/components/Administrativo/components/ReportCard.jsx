"use client"

import PropTypes from "prop-types"

/**
 * Tarjeta resumen de reporte (versión Administrador).
 */
export default function ReportCard({ reporte, onReviewClick }) {
  /* Badge según estado */
  const badge = {
    Aprobado   : "bg-green-100 text-green-800",
    Rechazado  : "bg-red-100 text-red-800",
    Devuelto   : "bg-yellow-100 text-yellow-800",
    "En revisión": "bg-blue-100 text-blue-800"
  }[reporte.status] || "bg-gray-100 text-gray-800"

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Encabezado */}
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-medium text-gray-900 truncate flex-1">{reporte.solicitante}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge}`}>
          {reporte.status}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="p-4">
        <h2 className="font-bold text-lg mb-2 text-gray-800">{reporte.titulo}</h2>

        <div className="text-sm mb-3">
          <span className="text-gray-500 mr-1">Entregado:</span>
          <span className="text-gray-900 font-medium">{reporte.fechaEntrega}</span>
        </div>

        {reporte.comentariosAdmin && (
          <div className="mb-3 p-2 bg-gray-50 rounded-md text-sm">
            <p className="text-gray-500 font-medium">Comentarios:</p>
            <p className="text-gray-700">{reporte.comentariosAdmin}</p>
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
