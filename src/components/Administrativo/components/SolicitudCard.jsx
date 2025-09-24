import React from "react";
import { useTheme } from "../../../context/ThemeContext";

export default function SolicitudCard({ solicitud, onReviewClick, isAdmin = true }) {
  const { darkMode } = useTheme();  // Obtenemos el color de badge según el status
  const getBadgeColor = (status) => {
    if (darkMode) {
      switch (status) {
        case "Aprobada":
          return "bg-green-900 text-green-100";
        case "Rechazada":
          return "bg-red-900 text-red-100";
        case "Devuelta":
          return "bg-yellow-900 text-yellow-100";
        default:
          return "bg-blue-900 text-blue-100";
      }
    } else {
      switch (status) {
        case "Aprobada":
          return "bg-green-100 text-green-800";
        case "Rechazada":
          return "bg-red-100 text-red-800";
        case "Devuelta":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-blue-100 text-blue-800";
      }
    }
  };
  return (
    <div className={`rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Encabezado de la card */}
      <div className={`px-4 py-2 border-b flex justify-between items-center ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`font-medium truncate flex-1 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{solicitud.solicitante}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeColor(
            solicitud.status
          )}`}
        >
          {solicitud.status}
        </span>
      </div>      {/* Contenido de la solicitud */}
      <div className="p-4">
        <h2 className={`font-bold text-lg mb-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>{solicitud.titulo}</h2>
          <div className="mb-3">
          <div className="text-sm mb-1">
            <span className={`mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación:</span>
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{solicitud.ciudad}, {solicitud.pais}</span>
          </div>          <div className="text-sm mb-1">
            <span className={`mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fecha:</span>
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{solicitud.fechaSalida} - {solicitud.fechaRegreso}</span>
          </div>
          <div className="text-sm mb-1">
            <span className={`mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Horario:</span>
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{solicitud.horaSalida || '--:--'} - {solicitud.horaRegreso || '--:--'}</span>
          </div>
          <div className="text-sm">
            <span className={`mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Participación:</span>
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{solicitud.tipoParticipacion}</span>
          </div>
        </div>

        {/* Resumen de historial */}
        <div className={`mt-2 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {(solicitud.ultimoCambioFecha || solicitud.ultimoCambioActor) && (
            <div className="mb-1">
              <span className="font-medium">Último cambio:</span>
              <span> {solicitud.ultimoCambioFecha || '—'}</span>
              {solicitud.ultimoCambioActor && <span> • por {solicitud.ultimoCambioActor}</span>}
            </div>
          )}
          {typeof solicitud.historialCount === 'number' && (
            <div>
              <span className="font-medium">Historial:</span>
              <span> {solicitud.historialCount} evento{solicitud.historialCount === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>

        {/* Si hay comentarios del administrador, mostrarlos */}
        {solicitud.comentariosAdmin && (
          <div className="mb-3 p-2 bg-gray-50 rounded-md text-sm">
            <p className="text-gray-500 font-medium">Comentarios:</p>
            <p className="text-gray-700">{solicitud.comentariosAdmin}</p>
          </div>
        )}

        <div className="flex justify-end mt-3">
          <button
            onClick={onReviewClick}
            className="inline-flex items-center px-3 py-1.5 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {solicitud.status === "En revisión" ? "Revisar" : "Ver detalles"}
          </button>
        </div>
      </div>
    </div>
  );
}
