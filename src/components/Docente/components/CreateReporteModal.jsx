"use client"

import PropTypes from "prop-types"
import { useRef } from "react"
import { useTheme } from "../../../context/ThemeContext"

export default function CreateReporteModal({
  show,
  close,
  nuevoReporte,
  setNuevoReporte,
  guardarReporte
}) {
  const fileInputRef = useRef(null)
  const { darkMode } = useTheme();
  
  // Clases adaptativas para el modo oscuro
  const labelClass = `block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full rounded-lg px-3 py-2 ${darkMode ? 'border border-gray-600 bg-gray-700 text-white' : 'border border-gray-300 bg-white'}`;
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const buttonPrimaryClass = `px-6 py-2 bg-green-700 text-white font-medium rounded-full hover:bg-green-800`;
  const buttonSecondaryClass = `px-6 py-2 font-medium rounded-full ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`;
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} w-full max-w-3xl rounded-xl p-8 shadow-lg max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 border-b pb-3 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Crear reporte</h2>
          <button
            onClick={resetAndClose}
            className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 gap-6">          {/* Título */}
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
              type="file"
              accept=".pdf,.zip"
              ref={fileInputRef}
              onChange={handleFileChange}
              className={inputClass}
            />
          </div>
        </div>        {/* Botones */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={resetAndClose}
            className={buttonSecondaryClass + " text-sm"}
          >
            Cancelar
          </button>
          <button
            onClick={guardarReporte}
            className={buttonPrimaryClass + " text-sm"}
          >
            Guardar
          </button>
        </div>
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
