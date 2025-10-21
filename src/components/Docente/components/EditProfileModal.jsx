"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"

function buildInitial(profile, fields) {
  const initial = {};
  fields.forEach(({ key }) => {
    initial[key] = profile?.[key] ?? "";
  });
  return initial;
}

export default function EditProfileModal({ open, close, profile, save, fields }) {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState(() => buildInitial(profile, fields))
  const [processing, setProcessing] = useState(false)

  /* Sincroniza los datos cada vez que se abre el modal */
  useEffect(() => {
    if (open) setFormData(buildInitial(profile, fields))
  }, [open, profile, fields])

  if (!open) return null

  const handleChange = (e, editable) => {
    if (!editable) return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (processing) return
    setProcessing(true)
    try {
      const ok = await Promise.resolve(save(formData));
      if (ok === false) {
        setProcessing(false);
        return;
      }
      setProcessing(false);
    } catch (e) {
      console.error("[Perfil] Error guardando perfil", e);
      setProcessing(false);
    }
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl w-full max-w-xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Editar perfil</h3>

        {/* Formulario */}
        <div className="grid grid-cols-1 gap-4">
          {fields.map(({ key, label, editable = true, transform }) => {
            const value = formData[key] ?? "";
            const baseLabel = label ?? key;
            const isEditable = editable !== false;

            const readOnlyClasses = `w-full rounded-lg px-3 py-2 ${
              darkMode ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-200 bg-gray-100 text-gray-500'
            }`;
            const inputClasses = `w-full rounded-lg px-3 py-2 ${
              darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'
            }`;

            if (!isEditable) {
              return (
                <div key={key}>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {baseLabel}
                  </label>
                  <input
                    name={key}
                    value={transform ? transform(value) : value ?? ""}
                    className={readOnlyClasses}
                    readOnly
                    disabled
                  />
                </div>
              );
            }

            return (
              <div key={key}>
                <label className={`block text-sm font-medium capitalize mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {baseLabel}
                </label>
                <input
                  name={key}
                  value={value ?? ""}
                  onChange={(e) => handleChange(e, isEditable)}
                  className={inputClasses}
                />
              </div>
            );
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
  save: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      editable: PropTypes.bool,
      transform: PropTypes.func,
    })
  ).isRequired,
}
