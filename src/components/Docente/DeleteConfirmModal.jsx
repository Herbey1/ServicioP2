"use client"

export default function DeleteConfirmModal({ showDeleteConfirm, cancelDelete, confirmDelete }) {
  return (
    showDeleteConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white p-6 rounded-xl shadow-lg w-96">
          <h3 className="text-xl font-bold mb-4">Eliminar solicitud</h3>
          <p className="text-gray-700 mb-6">
            ¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={cancelDelete}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmDelete}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    )
  )
}
