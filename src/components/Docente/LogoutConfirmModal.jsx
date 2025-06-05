"use client"

export default function LogoutConfirmModal({ showLogoutConfirm, cancelLogout, handleLogout }) {
  return (
    showLogoutConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-96">
          <h3 className="text-xl font-bold mb-4">Cerrar sesión</h3>
          <p className="text-gray-700 mb-6">¿Estás seguro que deseas cerrar tu sesión actual?</p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={cancelLogout}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={handleLogout}
              className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    )
  )
}
