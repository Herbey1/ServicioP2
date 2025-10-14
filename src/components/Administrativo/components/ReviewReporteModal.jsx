"use client"

import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useTheme } from "../../../context/ThemeContext"
import { apiFetch } from "../../../api/client"

export default function ReviewReporteModal({
  isOpen,
  onClose,
  reporte,
  onApprove,
  onReject,
  onReturn
}) {
  const [comments, setComments] = useState("")
  const [processing, setProcessing] = useState(false) // evita duplicados
  const { darkMode } = useTheme();
  const [historial, setHistorial] = useState([])
  const [loadingHist, setLoadingHist] = useState(false)

  const handleAction = async (action) => {
    if (processing) return
    setProcessing(true)
    try {
      await action(comments)
      // El modal se cerrará automáticamente desde el dashboard
      setComments("") // Limpiar comentarios
    } catch (error) {
      console.error('Error en acción:', error)
      setProcessing(false) // Re-habilitar botones si hay error
    }
  }
  
  useEffect(() => {
    async function load() {
      try {
        setLoadingHist(true)
        const detail = await apiFetch(`/api/reportes/${reporte.id}`)
        setHistorial(detail.estados_hist || [])
      } catch (e) {
        console.error('Error cargando historial de reporte', e)
      } finally {
        setLoadingHist(false)
      }
    }
    if (isOpen && reporte?.id) load()
  }, [isOpen, reporte?.id])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reporte.titulo}</h2>          {/* Datos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Datos del solicitante</h3>
              <p><span className="font-medium">Solicitante:</span> {reporte.solicitante}</p>
              <p><span className="font-medium">Fecha de entrega:</span> {reporte.fechaEntrega}</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Estado del reporte</h3>
              <p><span className="font-medium">Status:</span> {reporte.status}</p>
              {reporte.evidencia && (
                <p className="text-sm text-blue-600 mt-1">Archivo adjunto</p>
              )}
            </div>
          </div>          {/* Descripción */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Descripción / resultados</h3>
            <p className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded`}>{reporte.descripcion}</p>
          </div>

          {/* Historial de estados */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white border-gray-600' : 'text-gray-800 border-gray-200'} border-b pb-2`}>Historial de estados</h3>
            {loadingHist ? (
              <p className="text-sm opacity-75">Cargando historial…</p>
            ) : historial.length === 0 ? (
              <p className="text-sm opacity-75">Sin registro de cambios</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {historial.map((h, i) => (
                  <li key={i} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between">
                      <span>
                        {h.de_estado ? h.de_estado.replace(/_/g,' ').toLowerCase() : '—'} → {h.a_estado.replace(/_/g,' ').toLowerCase()}
                      </span>
                      <span className="opacity-70">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    {h.motivo && <div className="mt-1 opacity-90">Motivo: {h.motivo}</div>}
                    {h.actor && <div className="mt-1 opacity-90">Por: {h.actor.nombre}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Comentarios */}
          <div className="mb-6">
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Comentarios administrativos</label>
            <textarea
              className={`w-full border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-md p-2 min-h-[100px]`}
              placeholder="Ingrese sus comentarios…"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {/* Botones - Condicionalmente según el estado */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-md`}
            >
              {reporte.status === "En revisión" ? "Cancelar" : "Cerrar"}
            </button>
            
            {/* Solo mostrar botones de acción si está en revisión */}
            {reporte.status === "En revisión" && (
              <>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onReturn)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-60"
                >
                  Devolver para corrección
                </button>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onReject)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-60"
                >
                  Rechazar
                </button>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onApprove)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
                >
                  Aprobar
                </button>
              </>
            )}

            {/* Botones específicos para cada estado */}
            {reporte.status === "Aprobado" && (
              <>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onReturn)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-60"
                >
                  Devolver para corrección
                </button>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onReject)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-60"
                >
                  Rechazar
                </button>
              </>
            )}

            {reporte.status === "Rechazado" && (
              <>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onReturn)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-60"
                >
                  Devolver para corrección
                </button>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onApprove)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
                >
                  Aprobar
                </button>
              </>
            )}

            {reporte.status === "Devuelto" && (
              <>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onReject)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-60"
                >
                  Rechazar
                </button>
                <button
                  disabled={processing}
                  onClick={() => handleAction(onApprove)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
                >
                  Aprobar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

ReviewReporteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reporte: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onReturn: PropTypes.func.isRequired
}
