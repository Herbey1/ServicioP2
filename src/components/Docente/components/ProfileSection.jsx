"use client"

import { useState } from "react"
import EditProfileModal from "./EditProfileModal"
import { useTheme } from "../../../context/ThemeContext"
import DarkModeToggle from "../../common/DarkModeToggle"

export default function ProfileSection() {
  const { darkMode } = useTheme();
  /* ——— datos de ejemplo; aquí conectarás con tu API ——— */
  const [profile, setProfile] = useState({
    nombre     : "Fernando Huerta",
    correo     : "fernando.huerta@uabc.edu.mx",
    departamento: "Ingeniería en Computación",
    categoria  : "Docente", // Valor predeterminado para el perfil docente
    telefono   : "(646) 123-4567"
  })

  const [showEdit, setShowEdit] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      {/* Tarjeta de información */}
      <div className={`rounded-xl shadow p-8 w-full max-w-3xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mi perfil</h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(profile).map(([label, value]) => (
            <div key={label}>
              <dt className={`text-sm font-medium capitalize ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                {label === "categoria"
                  ? "Categoría"
                  : label === "departamento"
                    ? "Programa educativo"
                    : label === "telefono"
                      ? "Teléfono"
                      : label}
              </dt>
              <dd className={`text-lg font-semibold break-all ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</dd>
            </div>
          ))}
        </dl>        <div className="mt-8 flex justify-end">
          <div className="flex items-center gap-4">
            {/* DarkMode Toggle */}
            <div className="flex items-center gap-2">
              <DarkModeToggle />
            </div>
            
            <button
              onClick={() => setShowEdit(true)}
              className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-full text-sm font-medium"
            >
              Editar perfil
            </button>
          </div>
        </div>
      </div>

      {/* Modal edición */}
      <EditProfileModal
        open={showEdit}
        profile={profile}
        close={() => setShowEdit(false)}
        save={(updated) => {
          setProfile(updated)
          setShowEdit(false)
        }}
      />
    </div>
  )
}
