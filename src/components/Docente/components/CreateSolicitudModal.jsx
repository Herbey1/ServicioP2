"use client"

export default function CreateSolicitudModal({ 
  showCreateModal, 
  setShowCreateModal, 
  newSolicitud, 
  setNewSolicitud, 
  handleCreateSolicitud, 
  tiposParticipacion, 
  programasEducativos 
}) {
  return (
    showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
            <h3 className="text-xl font-bold">Crear solicitud</h3>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Información del solicitante */}
            <div className="col-span-2 mb-2">
              <div className="flex justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-700">Nombre del docente:</span>
                  <span className="text-gray-900">{newSolicitud.solicitante}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700">Número de empleado:</span>
                  <span className="text-gray-900">123456</span>
                </div>
              </div>
            </div>
            
            {/* Título de la comisión */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.titulo}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, titulo: e.target.value })}
                placeholder="Título de la comisión"
                required
              />
            </div>
            
            {/* Tipo de participación (selector) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de participación: <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.tipoParticipacion}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, tipoParticipacion: e.target.value })}
              >
                {tiposParticipacion.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            
            {/* Ciudad y País */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad / País: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.ciudad}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, ciudad: e.target.value })}
                  placeholder="Ciudad"
                  required
                />
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.pais}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, pais: e.target.value })}
                  placeholder="País"
                  required
                />
              </div>
            </div>
            
            {/* Lugar */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lugar específico: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.lugar}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, lugar: e.target.value })}
                placeholder="Lugar específico donde se realizará la actividad"
                required
              />
            </div>
            
            {/* Fechas de salida y regreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de salida: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.fechaSalida}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, fechaSalida: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de regreso: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.fechaRegreso}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, fechaRegreso: e.target.value })}
                required
              />
            </div>
            
            {/* Horas de salida y regreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de salida: <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.horaSalida}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, horaSalida: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de regreso: <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.horaRegreso}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, horaRegreso: e.target.value })}
                required
              />
            </div>
            
            {/* Número de personas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de personas: <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.numeroPersonas}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, numeroPersonas: parseInt(e.target.value) || 1 })}
                required
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
                    name="necesitaTransporteNuevo"
                    checked={newSolicitud.necesitaTransporte === true}
                    onChange={() => setNewSolicitud({ ...newSolicitud, necesitaTransporte: true })}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio"
                    className="form-radio text-green-700"
                    name="necesitaTransporteNuevo"
                    checked={newSolicitud.necesitaTransporte === false}
                    onChange={() => setNewSolicitud({ ...newSolicitud, necesitaTransporte: false })}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
            
            {/* Cantidad de combustible (si necesita transporte) */}
            {newSolicitud.necesitaTransporte && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de combustible (litros):
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newSolicitud.cantidadCombustible}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, cantidadCombustible: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
            
            {/* Programa educativo */}
            <div className={newSolicitud.necesitaTransporte ? "col-span-1" : "col-span-2"}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programa educativo que apoya: <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={newSolicitud.programaEducativo}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, programaEducativo: e.target.value })}
                required
              >
                {programasEducativos.map(programa => (
                  <option key={programa} value={programa}>{programa}</option>
                ))}
              </select>
            </div>
            
            {/* Proyecto de investigación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto de investigación:
              </label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center">
                  <input 
                    type="radio"
                    className="form-radio text-green-700"
                    name="proyectoInvestigacionNuevo"
                    checked={newSolicitud.proyectoInvestigacion === true}
                    onChange={() => setNewSolicitud({ ...newSolicitud, proyectoInvestigacion: true })}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio"
                    className="form-radio text-green-700"
                    name="proyectoInvestigacionNuevo"
                    checked={newSolicitud.proyectoInvestigacion === false}
                    onChange={() => setNewSolicitud({ ...newSolicitud, proyectoInvestigacion: false })}
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
                    name="obtendraConstanciaNuevo"
                    checked={newSolicitud.obtendraConstancia === true}
                    onChange={() => setNewSolicitud({ ...newSolicitud, obtendraConstancia: true })}
                  />
                  <span className="ml-2">Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio"
                    className="form-radio text-green-700"
                    name="obtendraConstanciaNuevo"
                    checked={newSolicitud.obtendraConstancia === false}
                    onChange={() => setNewSolicitud({ ...newSolicitud, obtendraConstancia: false })}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
            
            {/* Comentarios adicionales */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios adicionales:
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                value={newSolicitud.comentarios}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, comentarios: e.target.value })}
                placeholder="Comentarios adicionales sobre la actividad"
              ></textarea>
            </div>

            {/* Nota sobre campos obligatorios */}
            <div className="col-span-2 mt-2">
              <p className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Campos obligatorios
              </p>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateSolicitud}
              className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    )
  )
}
