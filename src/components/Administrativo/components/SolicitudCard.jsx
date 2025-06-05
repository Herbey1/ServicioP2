import React from "react";

export default function SolicitudCard({ solicitud, onReviewClick, isAdmin = true }) {
  // Obtenemos el color de badge según el status
  const getBadgeColor = (status) => {
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
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
      {/* Encabezado de la card */}
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-medium text-gray-900 truncate flex-1">{solicitud.solicitante}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeColor(
            solicitud.status
          )}`}
        >
          {solicitud.status}
        </span>
      </div>

      {/* Contenido de la solicitud */}
      <div className="p-4">
        <h2 className="font-bold text-lg mb-2 text-gray-800">{solicitud.titulo}</h2>
          <div className="mb-3">
          <div className="text-sm mb-1">
            <span className="text-gray-500 mr-1">Ubicación:</span>
            <span className="text-gray-900 font-medium">{solicitud.ciudad}, {solicitud.pais}</span>
          </div>          <div className="text-sm mb-1">
            <span className="text-gray-500 mr-1">Fecha:</span>
            <span className="text-gray-900 font-medium">{solicitud.fechaSalida} - {solicitud.fechaRegreso}</span>
          </div>
          <div className="text-sm mb-1">
            <span className="text-gray-500 mr-1">Horario:</span>
            <span className="text-gray-900 font-medium">{solicitud.horaSalida || '--:--'} - {solicitud.horaRegreso || '--:--'}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 mr-1">Participación:</span>
            <span className="text-gray-900 font-medium">{solicitud.tipoParticipacion}</span>
          </div>
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
