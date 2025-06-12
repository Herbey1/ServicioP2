"use client"

import PropTypes from "prop-types"

/**
 * Tarjeta para mostrar un reporte en la lista.
 * @param {Object}   props.reporte         Objeto con los datos del reporte
 * @param {Number}   props.index           Índice dentro de la lista
 * @param {Object}   props.statusColors    Diccionario de colores por estado
 * @param {Function} props.handleEdit      Función que abre el modal de edición
 */
export default function ReportCard({ reporte, index, statusColors, handleEdit }) {
  const { text = "text-gray-700", bg = "bg-gray-100" } =
    statusColors[reporte.status] ?? {}

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
      {/* Información principal */}
      <div className="mr-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-lg">{reporte.titulo}</h3>
          {reporte.id && (
            <span className="text-xs bg-purple-100 text-purple-800 py-0.5 px-2 rounded">
              {reporte.id}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Entregado por: <span className="font-medium">{reporte.solicitante}</span>
        </p>
      </div>

      {/* Detalles y acciones */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-gray-500">Fecha de entrega</p>
          <p className="font-medium">{reporte.fechaEntrega}</p>
        </div>

        <span className={`${text} ${bg} rounded-full px-3 py-1 text-sm font-medium`}>
          {reporte.status}
        </span>

        {["En revisión", "Requiere correcciones", "Devuelto"].includes(
          reporte.status
        ) && (
          <button
            onClick={() => handleEdit(reporte, index)}
            className="text-green-700 hover:text-green-900 font-medium text-sm"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )
}

ReportCard.propTypes = {
  reporte: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  statusColors: PropTypes.object.isRequired,
  handleEdit: PropTypes.func.isRequired
}
