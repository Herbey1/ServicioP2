"use client"

import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"

/**
 * Tarjeta para mostrar un reporte en la lista.
 * @param {Object}   props.reporte         Objeto con los datos del reporte
 * @param {Number}   props.index           Índice dentro de la lista
 * @param {Object}   props.statusColors    Diccionario de colores por estado
 * @param {Function} props.handleEdit      Función que abre el modal de edición
 */
export default function ReportCard({ reporte, index, statusColors, handleEdit }) {
  const { darkMode } = useTheme();  const { text = darkMode ? "text-gray-200" : "text-gray-700", 
          bg = darkMode ? "bg-gray-700" : "bg-gray-100" } =
    statusColors[reporte.status] ?? {}

  return (
    <div className={`rounded-xl p-4 flex justify-between items-center ${
      darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
    }`}>
      {/* Información principal */}
      <div className="mr-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reporte.titulo}</h3>
          {reporte.id && (
            <span className={`text-xs py-0.5 px-2 rounded ${
              darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
            }`}>
              {reporte.id}
            </span>
          )}
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Entregado por: <span className="font-medium">{reporte.solicitante}</span>
        </p>
      </div>      {/* Detalles y acciones */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de entrega</p>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reporte.fechaEntrega}</p>
        </div>

        <span className={`${text} ${bg} rounded-full px-3 py-1 text-sm font-medium`}>
          {reporte.status}
        </span>

        {["En revisión", "Requiere correcciones", "Devuelto"].includes(
          reporte.status
        ) && (
          <button
            onClick={() => handleEdit(reporte, index)}
            className="text-green-700 hover:text-green-900 font-medium text-sm"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )
}

ReportCard.propTypes = {
  reporte: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  statusColors: PropTypes.object.isRequired,
  handleEdit: PropTypes.func.isRequired
}
