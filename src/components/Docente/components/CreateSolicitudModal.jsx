"use client"

import { useTheme } from "../../../context/ThemeContext";

export default function CreateSolicitudModal({
  showCreateModal,
  setShowCreateModal,
  newSolicitud,
  setNewSolicitud,
  handleCreateSolicitud,
  tiposParticipacion,
  programasEducativos
}) {
  const { darkMode } = useTheme();

  // Funciones para generar clases adaptadas al modo oscuro
  const labelClass = `block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full rounded-lg px-3 py-2 ${darkMode ? 'border border-gray-600 bg-gray-700 text-white' : 'border border-gray-300 bg-white'}`;
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const sectionTitleClass = `text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`;
  const buttonPrimaryClass = `px-6 py-2 bg-green-700 text-white font-medium rounded-full hover:bg-green-800`;
  const buttonSecondaryClass = `px-6 py-2 font-medium rounded-full ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`;

  return (
    showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="crear-solicitud-title">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto`}>
          <div className={`flex justify-between items-center mb-6 pb-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 id="crear-solicitud-title" className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Crear solicitud</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreateSolicitud} noValidate>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Información del solicitante */}
            <div className="col-span-2 mb-2">              <div className="flex justify-between">
                <div>
                  <span className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre del docente:</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{newSolicitud.solicitante}</span>
                </div>
                <div>
                  <span className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Número de empleado:</span>
                  <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>123456</span>
                </div>
              </div>
            </div>

            {/* Título de la comisión */}
            <div className="col-span-2">              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Asunto: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full rounded-lg px-3 py-2 ${darkMode ? 'border border-gray-600 bg-gray-700 text-white' : 'border border-gray-300 bg-white'}`}
                value={newSolicitud.titulo}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, titulo: e.target.value })}
                placeholder="Título de la comisión"
                required
              />
            </div>

            {/* Tipo de participación (selector) */}
            <div>
              <label className={labelClass}>
                Tipo de participación: <span className="text-red-500">*</span>
              </label>
              <select
                className={inputClass}
                value={newSolicitud.tipoParticipacionId ?? ""}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, tipoParticipacionId: parseInt(e.target.value) })}
                required
              >
                {tiposParticipacion.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>
              {/* Ciudad y País */}
            <div>
              <label className={labelClass}>
                Ciudad / País: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  className={inputClass}
                  value={newSolicitud.ciudad}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, ciudad: e.target.value })}
                  placeholder="Ciudad"
                  required
                />
                <input
                  type="text"
                  className={inputClass}
                  value={newSolicitud.pais}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, pais: e.target.value })}
                  placeholder="País"
                  required
                />
              </div>
            </div>
              {/* Lugar */}
            <div className="col-span-2">
              <label className={labelClass}>
                Lugar específico: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={newSolicitud.lugar}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, lugar: e.target.value })}
                placeholder="Lugar específico donde se realizará la actividad"
                required
              />
            </div>
              {/* Fechas de salida y regreso */}
            <div>
              <label className={labelClass}>
                Fecha de salida: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                value={newSolicitud.fechaSalida}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, fechaSalida: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Fecha de regreso: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                value={newSolicitud.fechaRegreso}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, fechaRegreso: e.target.value })}
                required
              />
            </div>
              {/* Horas de salida y regreso */}
            <div>
              <label className={labelClass}>
                Hora de salida: <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={inputClass}
                value={newSolicitud.horaSalida}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, horaSalida: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Hora de regreso: <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={inputClass}
                value={newSolicitud.horaRegreso}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, horaRegreso: e.target.value })}
                required
              />
            </div>
              {/* Número de personas */}
            <div>
              <label className={labelClass}>
                Número de personas: <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={newSolicitud.numeroPersonas}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, numeroPersonas: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
              {/* Necesita transporte */}
            <div>
              <label className={labelClass}>
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
                  <span className={`ml-2 ${textClass}`}>Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="necesitaTransporteNuevo"
                    checked={newSolicitud.necesitaTransporte === false}
                    onChange={() => setNewSolicitud({ ...newSolicitud, necesitaTransporte: false })}
                  />
                  <span className={`ml-2 ${textClass}`}>No</span>
                </label>
              </div>
            </div>
              {/* Cantidad de combustible (si necesita transporte) */}
            {newSolicitud.necesitaTransporte && (
              <div>
                <label className={labelClass}>
                  Cantidad de combustible (litros):
                </label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={newSolicitud.cantidadCombustible}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, cantidadCombustible: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
              {/* Programa educativo */}
            <div className={newSolicitud.necesitaTransporte ? "col-span-1" : "col-span-2"}>
              <label className={labelClass}>
                Programa educativo que apoya: <span className="text-red-500">*</span>
              </label>
              <select
                className={inputClass}
                value={newSolicitud.programaEducativoId ?? ""}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, programaEducativoId: parseInt(e.target.value) })}
                required
              >
                {programasEducativos.map(programa => (
                  <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                ))}
              </select>
            </div>
              {/* Proyecto de investigación */}
            <div>
              <label className={labelClass}>
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
                  <span className={`ml-2 ${textClass}`}>Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="proyectoInvestigacionNuevo"
                    checked={newSolicitud.proyectoInvestigacion === false}
                    onChange={() => setNewSolicitud({ ...newSolicitud, proyectoInvestigacion: false })}
                  />
                  <span className={`ml-2 ${textClass}`}>No</span>
                </label>
              </div>
            </div>
              {/* Se obtendrá constancia */}
            <div>
              <label className={labelClass}>
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
                  <span className={`ml-2 ${textClass}`}>Sí</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-green-700"
                    name="obtendraConstanciaNuevo"
                    checked={newSolicitud.obtendraConstancia === false}
                    onChange={() => setNewSolicitud({ ...newSolicitud, obtendraConstancia: false })}
                  />
                  <span className={`ml-2 ${textClass}`}>No</span>
                </label>
              </div>
            </div>
              {/* Comentarios adicionales */}
            <div className="col-span-2">
              <label className={labelClass}>
                Comentarios adicionales:
              </label>
              <textarea
                className={inputClass}
                rows="3"
                value={newSolicitud.comentarios}
                onChange={(e) => setNewSolicitud({ ...newSolicitud, comentarios: e.target.value })}
                placeholder="Comentarios adicionales sobre la actividad"
              ></textarea>
            </div>

            {/* Nota sobre campos obligatorios */}
            <div className="col-span-2 mt-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="text-red-500">*</span> Campos obligatorios
              </p>
            </div>
          </div>
            {/* Botones de acción */}
          <div className="flex justify-end mt-6 gap-3">
            <button type="button" onClick={() => setShowCreateModal(false)} className={buttonSecondaryClass + " text-sm"}>Cancelar</button>
            <button type="submit" className={buttonPrimaryClass + " text-sm"}>Aceptar</button>
          </div>
          </form>
        </div>
      </div>
    )
  )
}
