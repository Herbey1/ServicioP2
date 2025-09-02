"use client"

export default function EditSolicitudModal({
  modalEditData,
  setModalEditData,
  handleSaveEdit,
  handleDeleteClick,
  tiposParticipacion,
  programasEducativos
}) {
  return (
    modalEditData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
            <h3 className="text-xl font-bold">Editar Solicitud</h3>
            <button
              onClick={() => setModalEditData(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Si fue Devuelta, mostrar motivo del administrador */}
          {modalEditData?.comentariosAdmin && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
              <strong>Motivo de devolución:</strong> {modalEditData.comentariosAdmin}
            </div>
          )}

          {/* Contenido del modal de edición */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Título de la comisión */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la comisión
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.titulo}
                onChange={(e) => setModalEditData({ ...modalEditData, titulo: e.target.value })}
              />
            </div>

            {/* Solicitante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solicitante
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                value={modalEditData.solicitante}
                disabled
                readOnly
              />
            </div>

            {/* Tipo de participación (selector) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de participación
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.tipoParticipacionId ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, tipoParticipacionId: parseInt(e.target.value) })}
              >
                {tiposParticipacion.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.ciudad}
                onChange={(e) => setModalEditData({ ...modalEditData, ciudad: e.target.value })}
              />
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.pais}
                onChange={(e) => setModalEditData({ ...modalEditData, pais: e.target.value })}
              />
            </div>

            {/* Lugar */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lugar específico
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.lugar}
                onChange={(e) => setModalEditData({ ...modalEditData, lugar: e.target.value })}
              />
            </div>

            {/* Fechas de salida y regreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de salida
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.fechaSalida}
                onChange={(e) => setModalEditData({ ...modalEditData, fechaSalida: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de regreso
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.fechaRegreso}
                onChange={(e) => setModalEditData({ ...modalEditData, fechaRegreso: e.target.value })}
              />
            </div>

            {/* Horas de salida y regreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de salida
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.horaSalida}
                onChange={(e) => setModalEditData({ ...modalEditData, horaSalida: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de regreso
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.horaRegreso}
                onChange={(e) => setModalEditData({ ...modalEditData, horaRegreso: e.target.value })}
              />
            </div>

            {/* Número de personas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de personas
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.numeroPersonas}
                onChange={(e) => setModalEditData({ ...modalEditData, numeroPersonas: parseInt(e.target.value) })}
              />
            </div>

            {/* Necesita transporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Necesita unidad de transporte?
              </label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="necesitaTransporte"
                    checked={modalEditData.necesitaTransporte === true}
                    onChange={() => setModalEditData({ ...modalEditData, necesitaTransporte: true })}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="necesitaTransporte"
                    checked={modalEditData.necesitaTransporte === false}
                    onChange={() => setModalEditData({ ...modalEditData, necesitaTransporte: false })}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Cantidad de combustible (si necesita transporte) */}
            {modalEditData.necesitaTransporte && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de combustible (litros)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={modalEditData.cantidadCombustible}
                  onChange={(e) => setModalEditData({ ...modalEditData, cantidadCombustible: parseInt(e.target.value) })}
                />
              </div>
            )}

            {/* Programa educativo */}
            <div className={modalEditData.necesitaTransporte ? "col-span-1" : "col-span-2"}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programa educativo que apoya
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.programaEducativoId ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, programaEducativoId: parseInt(e.target.value) })}
              >
                {programasEducativos.map(programa => (
                  <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                ))}
              </select>
            </div>

            {/* Proyecto de investigación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Es proyecto de investigación?
              </label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="proyectoInvestigacion"
                    checked={modalEditData.proyectoInvestigacion === true}
                    onChange={() => setModalEditData({ ...modalEditData, proyectoInvestigacion: true })}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="proyectoInvestigacion"
                    checked={modalEditData.proyectoInvestigacion === false}
                    onChange={() => setModalEditData({ ...modalEditData, proyectoInvestigacion: false })}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Se obtendrá constancia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Se obtendrá constancia?
              </label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="obtendraConstancia"
                    checked={modalEditData.obtendraConstancia === true}
                    onChange={() => setModalEditData({ ...modalEditData, obtendraConstancia: true })}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="obtendraConstancia"
                    checked={modalEditData.obtendraConstancia === false}
                    onChange={() => setModalEditData({ ...modalEditData, obtendraConstancia: false })}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Comentarios adicionales */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios adicionales
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                value={modalEditData.comentarios}
                onChange={(e) => setModalEditData({ ...modalEditData, comentarios: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Nota informativa (si es una solicitud devuelta) */}
          {modalEditData.tab === "Devueltas" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Al guardar los cambios, esta solicitud pasará de "Devueltas" a "En revisión" y
                aparecerá en la pestaña de Pendientes.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between mt-6">
            {/* Botón de eliminar en el lado izquierdo */}
            <button
              onClick={handleDeleteClick}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium text-sm"
            >
              Eliminar solicitud
            </button>

            {/* Botones de cancelar y guardar en el lado derecho */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalEditData(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
