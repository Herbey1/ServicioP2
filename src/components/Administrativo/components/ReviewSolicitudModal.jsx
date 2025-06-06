import { useState } from "react";

export default function ReviewSolicitudModal({ isOpen, onClose, solicitud, onApprove, onReject, onReturn }) {
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{solicitud.titulo}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Datos del solicitante</h3>
              <p><span className="font-medium">Solicitante:</span> {solicitud.solicitante}</p>
              <p><span className="font-medium">Programa:</span> {solicitud.programaEducativo}</p>
              <p><span className="font-medium">Tipo de participación:</span> {solicitud.tipoParticipacion}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Datos del evento</h3>              <p><span className="font-medium">Lugar:</span> {solicitud.lugar}</p>
              <p><span className="font-medium">Ciudad:</span> {solicitud.ciudad}, {solicitud.pais}</p>
              <p><span className="font-medium">Fechas:</span> {solicitud.fechaSalida} al {solicitud.fechaRegreso}</p>
              <p><span className="font-medium">Hora de salida:</span> {solicitud.horaSalida || 'No especificada'}</p>
              <p><span className="font-medium">Hora de regreso:</span> {solicitud.horaRegreso || 'No especificada'}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Detalles adicionales</h3>
            <p><span className="font-medium">Número de personas:</span> {solicitud.numeroPersonas}</p>
            <p><span className="font-medium">Requiere transporte:</span> {solicitud.necesitaTransporte ? 'Sí' : 'No'}</p>
            {solicitud.necesitaTransporte && (
              <p><span className="font-medium">Cantidad de combustible:</span> {solicitud.cantidadCombustible} litros</p>
            )}
            <p><span className="font-medium">Proyecto de investigación:</span> {solicitud.proyectoInvestigacion ? 'Sí' : 'No'}</p>
            <p><span className="font-medium">Obtendrá constancia:</span> {solicitud.obtendraConstancia ? 'Sí' : 'No'}</p>
          </div>
          
          {solicitud.comentarios && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Comentarios del solicitante</h3>
              <p className="bg-gray-50 p-3 rounded">{solicitud.comentarios}</p>
            </div>
          )}
          
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              Comentarios administrativos
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 min-h-[120px]"
              placeholder="Ingrese sus comentarios..."
            ></textarea>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => onReturn(comments)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Devolver para corrección
            </button>
            <button
              onClick={() => onReject(comments)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Rechazar
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
