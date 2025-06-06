"use client"

import PropTypes from "prop-types"
import { useEffect, useRef, useState } from "react"

export default function EditReporteModal({
  modalData,          // { …reporte, tab, index }  o null
  setModalData,
  guardarCambios,
  eliminar
}) {
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(null)

  /* Sincroniza datos al abrir modal */
  useEffect(() => {
    if (modalData) setFormData({ ...modalData })
  }, [modalData])

  if (!modalData) return null

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleFileChange = (e) =>
    setFormData({ ...formData, evidencia: e.target.files[0] })

  const handleClose = () => {
    setModalData(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-3xl rounded-xl p-8 shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold">Editar reporte</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Nota si viene de Devueltos */}
        {modalData.tab === "Devueltos" && (
          <p className="mb-4 text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
            Este reporte fue devuelto para correcciones. Al guardar los cambios
            volverá a quedar <strong>En revisión</strong>.
          </p>
        )}

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
              value={formData.titulo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
              value={formData.fechaEntrega}
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
        <div className="mt-8 flex justify-between">          <button
            onClick={() => {
              if (window.confirm("¿Eliminar este reporte?")) eliminar()
            }}
            className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
          >
            Eliminar
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setModalData(formData)
                guardarCambios()
              }}
              className="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

EditReporteModal.propTypes = {
  modalData: PropTypes.object,
  setModalData: PropTypes.func.isRequired,
  guardarCambios: PropTypes.func.isRequired,
  eliminar: PropTypes.func.isRequired
}
