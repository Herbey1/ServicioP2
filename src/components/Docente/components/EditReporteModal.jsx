"use client"

import PropTypes from "prop-types"
import { useEffect, useRef, useState } from "react"
import { useTheme } from "../../../context/ThemeContext"

export default function EditReporteModal({
  modalData,          // { …reporte, tab, index }  o null
  setModalData,
  guardarCambios,
  eliminar,
  viewOnly = false
}) {
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(null)

  /* Sincroniza datos al abrir modal */
  useEffect(() => {
    if (modalData) setFormData({ ...modalData })
  }, [modalData])

  if (!modalData || !formData) return null
  const { darkMode } = useTheme();
  const isReadOnly = !!viewOnly

  const inputBase = `w-full rounded-lg px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
  const textareaBase = inputBase;
  const labelClass = `${darkMode ? 'text-gray-200' : 'text-gray-700'}`;

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
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} w-full max-w-3xl rounded-xl p-8 shadow-lg max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 border-b pb-3 ${darkMode ? 'border-gray-700' : ''}`}>
          <h2 className="text-xl font-bold">{viewOnly ? 'Ver reporte' : 'Editar reporte'}</h2>
          <button
            onClick={handleClose}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Nota si viene de Devueltos + motivo */}
        {modalData.tab === "Devueltos" && (
          <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-900">
            <p>
              Este reporte fue devuelto para correcciones. Al guardar los cambios
              volverá a quedar <strong>En revisión</strong>.
            </p>
            {modalData.comentariosAdmin && (
              <p className="mt-2"><strong>Motivo de devolución:</strong> {modalData.comentariosAdmin}</p>
            )}
          </div>
        )}

        {/* Formulario */}
        <div className="grid grid-cols-1 gap-6">
          {/* Título */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
              Asunto de la comisión <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={inputBase}
              required
              disabled={isReadOnly}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
              Descripción / Resultados <span className="text-red-600">*</span>
            </label>
            <textarea
              name="descripcion"
              rows="4"
              value={formData.descripcion}
              onChange={handleChange}
              className={textareaBase}
              required
              disabled={isReadOnly}
            ></textarea>
          </div>

          {/* Fecha */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
              Fecha de entrega <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="fechaEntrega"
              value={formData.fechaEntrega}
              onChange={handleChange}
              className={inputBase}
              required
              disabled={isReadOnly}
            />
          </div>

          {/* Evidencia */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
              Evidencia (PDF o ZIP)
            </label>
            <input
              type="file"
              accept=".pdf,.zip"
              ref={fileInputRef}
              onChange={handleFileChange}
              className={inputBase}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 flex justify-between">
          {!viewOnly && (
            <button
              onClick={() => {
                if (window.confirm("¿Eliminar este reporte?")) eliminar()
              }}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
            >
              Eliminar
            </button>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleClose}
              className={`${darkMode ? 'px-5 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium' : 'px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium'}`}
            >
              Cancelar
            </button>

            {!viewOnly && (
              <button
                onClick={() => {
                  guardarCambios(formData)
                }}
                className="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-sm font-medium"
              >
                Guardar
              </button>
            )}
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
