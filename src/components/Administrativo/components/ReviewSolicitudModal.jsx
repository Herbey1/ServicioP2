"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"

export default function ReviewSolicitudModal({
  isOpen,
  onClose,
  solicitud,
  onApprove,
  onReject,
  onReturn
}) {  const [comments, setComments] = useState("")
  const [processing, setProcessing] = useState(false) // evita clicks dobles
  const { darkMode } = useTheme();

  if (!isOpen) return null

  /* Cierra el modal y ejecuta la acción */
  const handleAction = (action) => {
    if (processing) return
    setProcessing(true)
    action(comments)
    onClose()                 // cierre inmediato
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{solicitud.titulo}</h2>          {/* Datos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información del solicitante */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'} border-b pb-2`}>Información del solicitante</h3>
              <p><span className="font-medium">Solicitante:</span> {solicitud.solicitante}</p>
              {solicitud.numeroEmpleado && (
                <p><span className="font-medium">Número de empleado:</span> {solicitud.numeroEmpleado}</p>
              )}
              <p><span className="font-medium">Programa educativo:</span> {solicitud.programaEducativo || "No especificado"}</p>
              <p className="mt-2"><span className="font-medium">Status actual:</span> <span className={`px-2 py-0.5 rounded-full text-sm ${
                solicitud.status === "Aprobada" ? "bg-green-100 text-green-800" :
                solicitud.status === "Rechazada" ? "bg-red-100 text-red-800" :
                solicitud.status === "Devuelta" ? "bg-yellow-100 text-yellow-800" :
                "bg-blue-100 text-blue-800"
              }`}>{solicitud.status}</span></p>
            </div>            {/* Detalles de la comisión */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'} border-b pb-2`}>Detalles de la comisión</h3>
              <p><span className="font-medium">Tipo de participación:</span> {solicitud.tipoParticipacion}</p>
              <p><span className="font-medium">Ubicación:</span> {`${solicitud.ciudad}, ${solicitud.pais}`}</p>
              {solicitud.lugar && (
                <p><span className="font-medium">Lugar específico:</span> {solicitud.lugar}</p>
              )}
              <p className="mt-2"><span className="font-medium">Proyecto de investigación:</span> {solicitud.proyectoInvestigacion ? "Sí" : "No"}</p>
              <p><span className="font-medium">¿Obtiene constancia?:</span> {solicitud.obtendraConstancia ? "Sí" : "No"}</p>
            </div>
          </div>          {/* Fechas y logística */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'} border-b pb-2`}>Fechas y logística</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Fecha de salida:</span> {solicitud.fechaSalida}</p>
                <p><span className="font-medium">Fecha de regreso:</span> {solicitud.fechaRegreso}</p>
                {solicitud.horaSalida && (
                  <p><span className="font-medium">Horario:</span> {solicitud.horaSalida} - {solicitud.horaRegreso || '--:--'}</p>
                )}
              </div>
              <div>
                <p><span className="font-medium">Número de personas:</span> {solicitud.numeroPersonas || 1}</p>
                <p><span className="font-medium">Necesita transporte:</span> {solicitud.necesitaTransporte ? "Sí" : "No"}</p>
                {solicitud.necesitaTransporte && solicitud.cantidadCombustible > 0 && (
                  <p><span className="font-medium">Cantidad combustible:</span> {solicitud.cantidadCombustible} litros</p>
                )}
              </div>
            </div>
          </div>          {/* Comentarios adicionales del solicitante */}
          {solicitud.comentarios && (
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'} border-b pb-2`}>Comentarios del solicitante</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{solicitud.comentarios}</p>
            </div>
          )}
          
          {/* Comentarios previos del administrador */}
          {solicitud.comentariosAdmin && (
            <div className={`${darkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-100'} p-4 rounded-lg mb-6 border`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Comentarios administrativos previos</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{solicitud.comentariosAdmin}</p>
            </div>
          )}          {/* Comentarios nuevos */}
          <div className="mb-6">
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Comentarios administrativos</label>
            <textarea
              className={`w-full border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-md p-2 min-h-[100px]`}
              placeholder="Ingrese sus comentarios…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>          {/* Botones */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-md`}
            >
              Cancelar
            </button>
            <button
              disabled={processing}
              onClick={() => handleAction(onReturn)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-60"
            >
              Devolver
            </button>
            <button
              disabled={processing}
              onClick={() => handleAction(onReject)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-60"
            >
              Rechazar
            </button>
            <button
              disabled={processing}
              onClick={() => handleAction(onApprove)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
            >
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ReviewSolicitudModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  solicitud: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onReturn: PropTypes.func.isRequired
}
