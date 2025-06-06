"use client"

import { useState } from "react"
import EditProfileModal from "./EditProfileModal"

export default function ProfileSection() {
  /* ——— datos de ejemplo; aquí conectarás con tu API ——— */
  const [profile, setProfile] = useState({
    nombre     : "Fernando Huerta",
    correo     : "fernando.huerta@uabc.edu.mx",
    departamento: "Ingeniería en Computación",
    categoria  : "Profesor de Tiempo Completo",
    telefono   : "(646) 123-4567"
  })

  const [showEdit, setShowEdit] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* Tarjeta de información */}
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Mi perfil</h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(profile).map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm font-medium text-gray-500 capitalize">{label}</dt>
              <dd className="text-lg font-semibold text-gray-900 break-all">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowEdit(true)}
            className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-full text-sm font-medium"
          >
            Editar perfil
          </button>
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