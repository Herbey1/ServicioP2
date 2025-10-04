"use client"

import PropTypes from "prop-types"
import SkeletonList from "../../common/SkeletonList"
import { useTheme } from "../../../context/ThemeContext"

export default function UsuariosSection({
  usuarios,
  loading,
  onChangeRole,
  onToggleActive,
  busyUserId,
  onAddUser,
  addingUser = false
}) {
  const { darkMode } = useTheme()

  if (loading) {
    return <SkeletonList items={6} />
  }

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Gestiona el acceso de la comunidad académica. Cambia roles, suspende cuentas o agrega nuevos usuarios.
        </p>
        {onAddUser && (
          <button
            onClick={onAddUser}
            disabled={addingUser}
            className={`self-start sm:self-auto px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              addingUser
                ? 'bg-green-700/60 text-white cursor-not-allowed'
                : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          >
            {addingUser ? 'Guardando…' : '+ Agregar usuario'}
          </button>
        )}
      </div>

      {usuarios.length === 0 ? (
        <div className={`border rounded-lg p-8 text-center ${darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'}`}>
          No hay usuarios registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <thead>
              <tr className={darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}>
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold">Correo</th>
                <th className="text-left px-4 py-3 font-semibold">Ocupación</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
                <th className="text-right px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => {
                const isActive = !user.deleted_at
                const isBusy = busyUserId === user.id
                return (
                  <tr key={user.id} className={darkMode ? 'border-b border-gray-700' : 'border-b border-gray-100'}>
                    <td className="px-4 py-3 align-middle">{user.nombre}</td>
                    <td className="px-4 py-3 align-middle">{user.correo}</td>
                    <td className="px-4 py-3 align-middle">
                      <select
                        value={user.rol}
                        onChange={(e) => onChangeRole(user.id, e.target.value)}
                        disabled={!isActive || isBusy}
                        className={`rounded-md border px-3 py-1 text-sm ${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-800'}`}
                      >
                        <option value="DOCENTE">Docente</option>
                        <option value="ADMIN">Administrativo</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-500'}`} />
                        {isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onToggleActive(user.id, !isActive)}
                          disabled={isBusy}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed'
                              : 'border border-green-600 text-green-600 hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed'
                          }`}
                        >
                          {isActive ? 'Suspender' : 'Reactivar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

UsuariosSection.propTypes = {
  usuarios: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    nombre: PropTypes.string.isRequired,
    correo: PropTypes.string.isRequired,
    rol: PropTypes.string.isRequired,
    deleted_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.oneOf([null])
    ]),
    verificado: PropTypes.bool
  })).isRequired,
  loading: PropTypes.bool,
  onChangeRole: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  busyUserId: PropTypes.string,
  onAddUser: PropTypes.func,
  addingUser: PropTypes.bool
}
