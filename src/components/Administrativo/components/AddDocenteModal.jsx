"use client"

import { useEffect, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"

export default function AddDocenteModal({ isOpen, onClose, onSubmit, submitting = false }) {
  const { darkMode } = useTheme()
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [nombreTouched, setNombreTouched] = useState(false)
  const [correoTouched, setCorreoTouched] = useState(false)
  const [rol, setRol] = useState('DOCENTE')
  

  useEffect(() => {
    if (isOpen) {
      setNombre("")
      setCorreo("")
      setNombreTouched(false)
      setCorreoTouched(false)
      setRol('DOCENTE')
    }
  }, [isOpen])

  const validation = useMemo(() => {
    const trimmedName = nombre.trim()
    const trimmedEmail = correo.trim()
    const emailRegex = /^[A-Z0-9._%+-]+@uabc\.edu\.mx$/i
    return {
      nombre: !trimmedName ? "Ingrese el nombre del usuario" : null,
      correo: !trimmedEmail
        ? "Ingrese el correo electrónico institucional"
        : emailRegex.test(trimmedEmail)
          ? null
          : "El correo debe ser @uabc.edu.mx",
      // Nota: no se solicita contraseña; a los docentes se les asigna la contraseña por defecto y deberán cambiarla al entrar
    }
  }, [nombre, correo])

  if (!isOpen) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    setNombreTouched(true)
    setCorreoTouched(true)

    if (validation.nombre || validation.correo) {
      return
    }

    // No enviamos contraseña: backend asignará 'docente' por defecto para rol DOCENTE
    onSubmit({ nombre: nombre.trim(), correo: correo.trim(), rol })
  }

  const disableSubmit = submitting || Boolean(validation.nombre || validation.correo)

  const handleOverlayClick = () => {
    if (!submitting) onClose()
  }

  const cardClasses = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
  const inputClasses = darkMode
    ? 'w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500'
    : 'w-full border border-gray-300 bg-white text-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4" onClick={handleOverlayClick}>
      <div
        className={`${cardClasses} w-full max-w-md rounded-2xl shadow-lg p-6`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Agregar usuario</h2>
          <button
            type="button"
            onClick={handleOverlayClick}
            disabled={submitting}
            className={`text-2xl leading-none ${submitting ? 'opacity-50 cursor-not-allowed' : darkMode ? 'text-white hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
          >
            &times;
          </button>
        </div>

        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Completa la información para dar de alta un integrante y definir sus permisos iniciales.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="rol-usuario">
                Ocupación
              </label>
              <select
                id="rol-usuario"
                value={rol}
                onChange={(event) => setRol(event.target.value)}
                className={inputClasses}
                disabled={submitting}
              >
                <option value="DOCENTE">Docente</option>
                <option value="ADMIN">Administrativo</option>
              </select>
            </div>

            {/* Contraseña no requerida aquí. A los docentes se les asigna contraseña por defecto y deberán cambiarla al iniciar sesión. */}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nombre-docente">
              Nombre completo
            </label>
            <input
              id="nombre-docente"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              onBlur={() => setNombreTouched(true)}
              className={inputClasses}
              placeholder="Ej. María Pérez"
              disabled={submitting}
            />
            {nombreTouched && validation.nombre && (
              <p className="mt-1 text-sm text-red-500">{validation.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="correo-docente">
              Correo electrónico institucional
            </label>
            <input
              id="correo-docente"
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              onBlur={() => setCorreoTouched(true)}
              className={inputClasses}
              placeholder="Ej. maria.perez@uabc.edu.mx"
              pattern="^[^\s@]+@uabc\.edu\.mx$"
              disabled={submitting}
            />
            {correoTouched && validation.correo && (
              <p className="mt-1 text-sm text-red-500">{validation.correo}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleOverlayClick}
              disabled={submitting}
              className={`${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-full text-sm font-medium transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={disableSubmit}
              className={`bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors ${disableSubmit ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-800'}`}
            >
              {submitting ? 'Guardando…' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

AddDocenteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool
}
