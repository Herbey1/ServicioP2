"use client"

import PropTypes from "prop-types"
import { useRef } from "react"

export default function CreateReporteModal({
  show,
  close,
  nuevoReporte,
  setNuevoReporte,
  guardarReporte
}) {
  const fileInputRef = useRef(null)

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
      <div className="bg-white w-full max-w-3xl rounded-xl p-8 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold">Crear reporte</h2>
          <button
            onClick={resetAndClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 gap-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Asunto de la comisión <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={nuevoReporte.titulo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Ej. Congreso Nacional de Ingeniería"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción / Resultados <span className="text-red-600">*</span>
            </label>
            <textarea
              name="descripcion"
              rows="4"
              value={nuevoReporte.descripcion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Resumen de actividades realizadas, logros obtenidos, etc."
              required
            ></textarea>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha de entrega <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="fechaEntrega"
              value={nuevoReporte.fechaEntrega}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Evidencia */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Evidencia (PDF o ZIP)
            </label>
            <input
              type="file"
              accept=".pdf,.zip"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={resetAndClose}
            className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={guardarReporte}
            className="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium"
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
