"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"

export default function EditProfileModal({ open, close, profile, save }) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState(profile)
  const [processing, setProcessing] = useState(false)

  /* Sincroniza los datos cada vez que se abre el modal */
  useEffect(() => {
    if (open) setFormData(profile)
  }, [open, profile])

  if (!open) return null

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSave = () => {
    if (processing) return
    setProcessing(true)
    /** Aquí llamarías al endpoint PUT /perfil. Simulación: */
    setTimeout(() => {
      save(formData)          // actualiza en el padre
      setProcessing(false)
    }, 500)
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl w-full max-w-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Editar perfil</h3>

        {/* Formulario */}
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(formData).map(([label, value]) => {
            // Si el campo es "categoria", mostrarlo como "categoría" y deshabilitarlo
            if (label === "categoria") {
              return (
                <div key={label}>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Categoría</label>
                  <input
                    name={label}
                    value={value}
                    className={`w-full rounded-lg px-3 py-2 ${
                      darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'
                    }`}
                    readOnly
                    disabled
                  />
                </div>
              )
            }
            
            return (
              <div key={label}>
                <label className={`block text-sm font-medium capitalize mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label === "categoria" ? "Categoría" : label === "departamento" ? "Programa educativo" : label}
                </label>
                <input                  name={label}
                  value={value}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-3 py-2 ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={close}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-full"
          >
            Cancelar
          </button>
          <button
            disabled={processing}
            onClick={handleSave}
            className="px-5 py-2 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-medium rounded-full"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

EditProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired
}
