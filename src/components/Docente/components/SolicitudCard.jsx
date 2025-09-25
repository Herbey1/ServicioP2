"use client"

import { useTheme } from "../../../context/ThemeContext";

export default function SolicitudCard({ solicitud, index, statusColors, handleEditClick }) {
  const { darkMode } = useTheme();  return (
    <div
      className={`rounded-xl px-4 py-3 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{solicitud.titulo}</h3>
          {solicitud.id && (
            <span className={`text-xs py-0.5 px-2 rounded ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
              {solicitud.id}
            </span>
          )}
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{solicitud.solicitante}</p>
      </div>      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Salida:</p>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{solicitud.fechaSalida}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status:</p>
          <p className={`${statusColors[solicitud.status]?.text || (darkMode ? 'text-gray-200' : 'text-gray-700')} ${statusColors[solicitud.status]?.bg || (darkMode ? 'bg-gray-700' : 'bg-gray-100')} rounded px-2 py-0.5 inline-block text-sm font-semibold`}>
            {solicitud.status}
          </p>
        </div>
        {/* Botón Editar disponible en En revisión y Devuelta */}
        {["En revisión", "Devuelta", "Requiere correcciones"].includes(solicitud.status) && (
          <button
            onClick={() => handleEditClick(solicitud, index)}
            className={`font-medium text-sm ${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-700 hover:text-green-900'}`}
          >
            {solicitud.status === "Devuelta" ? "Corregir" : "Editar"}
          </button>
        )}
      </div>
    </div>
  )
}
