"use client"

import { useTheme } from "../../../context/ThemeContext";

export default function LogoutConfirmModal({ showLogoutConfirm, cancelLogout, handleLogout }) {
  const { darkMode } = useTheme();
  
  return (
    showLogoutConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-xl shadow-lg w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Cerrar sesión</h3>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>¿Estás seguro que deseas cerrar tu sesión actual?</p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={cancelLogout}
              className={`px-5 py-2 rounded-full font-medium text-sm ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
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
