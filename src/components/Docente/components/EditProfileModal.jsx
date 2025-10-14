"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"

export default function EditProfileModal({ open, close, profile, save }) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState(profile)
  const [processing, setProcessing] = useState(false)
  const [phoneError, setPhoneError] = useState("")

  /* Sincroniza los datos cada vez que se abre el modal */
  useEffect(() => {
    if (open) setFormData(profile)
  }, [open, profile])

  if (!open) return null

  const validateTelefono = (value) => {
    if (!value || !value.trim()) {
      return { valid: false, msg: "Ingresa un número de teléfono", normalized: null };
    }
    const trimmed = value.trim();
    const digits = trimmed.replace(/\D/g, "");
    const startsWithPlus52 = trimmed.startsWith("+52");

    if (startsWithPlus52 && digits.length === 12) {
      return { valid: true, msg: "", normalized: "+52" + digits.slice(-10) };
    }
    if (!startsWithPlus52 && digits.length === 10) {
      return { valid: true, msg: "", normalized: "+52" + digits };
    }
    if (startsWithPlus52 && digits.length < 12) {
      return { valid: false, msg: "Completa los 10 dígitos después de +52", normalized: null };
    }
    if (!startsWithPlus52 && digits.length < 10) {
      return { valid: false, msg: "El teléfono debe tener 10 dígitos", normalized: null };
    }
    return { valid: false, msg: "Formato inválido. Usa 10 dígitos o +52", normalized: null };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value })
    if (name === "telefono") {
      const { valid, msg } = validateTelefono(value);
      setPhoneError(valid ? "" : msg);
    }
  }

  const handleSave = () => {
    if (processing) return
    setProcessing(true)
    // Validar y normalizar teléfono antes de guardar
    const { valid, normalized, msg } = validateTelefono(formData.telefono);
    if (!valid) {
      setPhoneError(msg || "Teléfono inválido");
      setProcessing(false);
      return;
    }

    const normalizedData = { ...formData, telefono: normalized }

    /** Aquí llamarías al endpoint PUT /perfil. Simulación: */
    setTimeout(() => {
      save(normalizedData)    // actualiza en el padre con +52XXXXXXXXXX
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
            const isTelefono = label === "telefono";
            const shownLabel =
              label === "categoria"
                ? "Categoría"
                : label === "departamento"
                  ? "Programa educativo"
                  : label === "telefono"
                    ? "Teléfono"
                    : label;

            return (
              <div key={label}>
                <label className={`block text-sm font-medium capitalize mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {shownLabel}
                </label>
                <input
                  name={label}
                  value={value}
                  onChange={handleChange}
                  readOnly={!isTelefono}
                  disabled={!isTelefono}
                  inputMode={isTelefono ? "tel" : undefined}
                  autoComplete={isTelefono ? "tel" : undefined}
                  maxLength={isTelefono ? 20 : undefined}
                  aria-invalid={isTelefono ? (!!phoneError) : undefined}
                  className={`w-full rounded-lg px-3 py-2 ${
                    darkMode
                      ? (!isTelefono ? 'border-gray-600 bg-gray-700 text-gray-300 cursor-not-allowed' : 'border-gray-600 bg-gray-700 text-gray-300')
                      : (!isTelefono ? 'border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700')
                  }`}
                />
                {isTelefono && phoneError && (
                  <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                )}
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
            disabled={processing || !!phoneError}
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
