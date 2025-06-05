"use client"

export default function SolicitudCard({ solicitud, index, statusColors, handleEditClick }) {
  return (
    <div
      className="bg-gray-100 rounded-xl px-4 py-3 flex justify-between items-center"
    >
      <div>
        <h3 className="font-semibold">{solicitud.titulo}</h3>
        <p className="text-sm text-gray-600">{solicitud.solicitante}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-500">Fecha de Salida:</p>
          <p className="font-medium">{solicitud.fechaSalida}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Status:</p>
          <p className={`${statusColors[solicitud.status]?.text || 'text-gray-700'} ${statusColors[solicitud.status]?.bg || 'bg-gray-100'} rounded px-2 py-0.5 inline-block text-sm font-semibold`}>
            {solicitud.status}
          </p>
        </div>
        {["En revisión", "Requiere correcciones"].includes(solicitud.status) && (
          <button
            onClick={() => handleEditClick(solicitud, index)}
            className="text-green-700 hover:text-green-900 font-medium text-sm"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )
}
