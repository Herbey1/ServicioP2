"use client"

import PropTypes from "prop-types"
import { useId, useRef } from "react"
import { useTheme } from "../../../context/ThemeContext"

export default function CreateReporteModal({
  show,
  close,
  nuevoReporte,
  setNuevoReporte,
  guardarReporte,
  solicitudesDisponibles = []
}) {
  const fileInputRef = useRef(null)
  const { darkMode } = useTheme();
  
  // Clases adaptativas para el modo oscuro
  const labelClass = `block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full rounded-lg px-3 py-2 ${darkMode ? 'border border-gray-600 bg-gray-700 text-white' : 'border border-gray-300 bg-white'}`;
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const buttonPrimaryClass = `px-6 py-2 bg-green-700 text-white font-medium rounded-full hover:bg-green-800`;
  const buttonSecondaryClass = `px-6 py-2 font-medium rounded-full ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`;
  const fileButtonClass = `inline-flex items-center justify-center border border-green-700 text-green-700 px-4 py-2 rounded-full text-sm font-medium bg-transparent hover:bg-green-700 hover:text-white transition-colors`;
  const fileInputId = useId();
  
  if (!show) return null

  /* —— handlers internos —— */
  const handleChange = (e) =>
    setNuevoReporte({ ...nuevoReporte, [e.target.name]: e.target.value })

  const handleFileChange = (e) =>
    setNuevoReporte({ ...nuevoReporte, evidencia: e.target.files[0] })

  const resetAndClose = () => {
    setNuevoReporte({
      titulo: "",
      solicitante: "Fernando Huerta",
      descripcion: "",
      fechaEntrega: "",
      evidencia: null,
      status: "En revisión"
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
    close()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="crear-reporte-title">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} w-full max-w-3xl rounded-xl p-8 shadow-lg max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 border-b pb-3 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h2 id="crear-reporte-title" className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Crear reporte</h2>
          <button
            onClick={resetAndClose}
            className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={guardarReporte} noValidate>
        <div className="grid grid-cols-1 gap-6">
          {/* Solicitud relacionada */}
          <div>
            <label className={labelClass}>
              Selecciona la solicitud aprobada <span className="text-red-600">*</span>
            </label>
            <select
              className={inputClass}
              value={nuevoReporte.solicitudId || ''}
              onChange={(e) => setNuevoReporte({ ...nuevoReporte, solicitudId: e.target.value })}
              required
            >
              <option value="" disabled>Elige una solicitud…</option>
              {solicitudesDisponibles.map(s => (
                <option key={s.id} value={s.id}>{s.titulo} ({s.fechaSalida || '-'})</option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className={labelClass}>
              Asunto de la comisión <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={nuevoReporte.titulo}
              onChange={handleChange}
              className={inputClass}
              placeholder="Ej. Congreso Nacional de Ingeniería"
              required
            />
          </div>          {/* Descripción */}
          <div>
            <label className={labelClass}>
              Descripción / Resultados <span className="text-red-600">*</span>
            </label>
            <textarea
              name="descripcion"
              rows="4"
              value={nuevoReporte.descripcion}
              onChange={handleChange}
              className={inputClass}
              placeholder="Resumen de actividades realizadas, logros obtenidos, etc."
              required
            ></textarea>
          </div>

          {/* Fecha */}
          <div>
            <label className={labelClass}>
              Fecha de entrega <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="fechaEntrega"
              value={nuevoReporte.fechaEntrega}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>          {/* Evidencia */}
          <div>
            <label className={labelClass}>
              Evidencia (PDF o ZIP)
            </label>
            <input
              id={fileInputId}
              type="file"
              accept=".pdf,.zip"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor={fileInputId}
              className={fileButtonClass}
            >
              Seleccionar archivo
            </label>
            {nuevoReporte.evidencia && (
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {nuevoReporte.evidencia.name}
              </p>
            )}
          </div>
        </div>
        {/* Botones */}
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={resetAndClose} className={buttonSecondaryClass + " text-sm"}>Cancelar</button>
          <button type="submit" className={buttonPrimaryClass + " text-sm"}>Guardar</button>
        </div>
        </form>
      </div>
    </div>
  )
}

CreateReporteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  nuevoReporte: PropTypes.object.isRequired,
  setNuevoReporte: PropTypes.func.isRequired,
  guardarReporte: PropTypes.func.isRequired
}
