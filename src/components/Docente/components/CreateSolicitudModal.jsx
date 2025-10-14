"use client"

import { useId } from "react";
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
  const tipoOptions = Array.isArray(tiposParticipacion) ? tiposParticipacion : [];
  const programaOptions = Array.isArray(programasEducativos) ? programasEducativos : [];
  const tipoParticipacionValue = newSolicitud.tipoParticipacionId ?? "";
  const isOtroTipo = tipoParticipacionValue === "OTHER";
  const archivosSeleccionados = Array.isArray(newSolicitud?.archivos) ? newSolicitud.archivos : [];
  const fileInputId = useId();
  const fileButtonClass = `inline-flex items-center justify-center border border-green-700 text-green-700 px-4 py-2 rounded-full text-sm font-medium bg-transparent hover:bg-green-700 hover:text-white transition-colors`;

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const valid = [];
    const invalid = [];
    files.forEach((file) => {
      const mime = file.type?.toLowerCase() ?? "";
      const name = file.name?.toLowerCase() ?? "";
      const isPdf = mime === "application/pdf" || name.endsWith(".pdf");
      const isJpg = mime === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
      if (isPdf || isJpg) {
        valid.push(file);
      } else {
        invalid.push(file.name);
      }
    });

    if (invalid.length) {
      alert(`Solo se permiten archivos PDF o JPG. Archivos omitidos: ${invalid.join(", ")}`);
    }
    if (valid.length) {
      setNewSolicitud((prev) => ({
        ...prev,
        archivos: [...archivosSeleccionados, ...valid]
      }));
    }

    event.target.value = "";
  };

  const handleRemoveArchivo = (index) => {
    setNewSolicitud((prev) => {
      const current = Array.isArray(prev.archivos) ? prev.archivos : [];
      const next = [...current];
      next.splice(index, 1);
      return { ...prev, archivos: next };
    });
  };

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
                value={tipoParticipacionValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "OTHER") {
                    setNewSolicitud({ ...newSolicitud, tipoParticipacionId: "OTHER" });
                  } else {
                    const parsed = parseInt(value, 10);
                    setNewSolicitud({
                      ...newSolicitud,
                      tipoParticipacionId: Number.isNaN(parsed) ? "" : String(parsed),
                      tipoParticipacionOtro: ""
                    });
                  }
                }}
                required
              >
                <option value="">Selecciona una opción</option>
                {tipoOptions.map(tipo => (
                  <option key={tipo.id} value={String(tipo.id)}>{tipo.nombre}</option>
                ))}
                <option value="OTHER">Otros</option>
              </select>
              {isOtroTipo && (
                <input
                  type="text"
                  className={`${inputClass} mt-2`}
                  value={newSolicitud.tipoParticipacionOtro ?? ""}
                  onChange={(e) => setNewSolicitud({ ...newSolicitud, tipoParticipacionOtro: e.target.value })}
                  placeholder="Especifica el tipo de participación"
                  required
                />
              )}
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
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setNewSolicitud({ ...newSolicitud, programaEducativoId: Number.isNaN(value) ? null : value });
                }}
                required
              >
                <option value="">Selecciona una opción</option>
                {programaOptions.map(programa => (
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
              {/* Archivos adjuntos */}
            <div className="col-span-2">
              <label className={labelClass}>
                Documentación de apoyo (PDF o JPG):
              </label>
              <input
                id={fileInputId}
                type="file"
                className="hidden"
                accept=".pdf,image/jpeg"
                multiple
                onChange={handleFileSelection}
              />
              <label
                htmlFor={fileInputId}
                className={fileButtonClass}
              >
                Seleccionar archivo
              </label>
              {archivosSeleccionados.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {archivosSeleccionados.map((file, idx) => (
                    <li key={`${file.name}-${idx}`} className="flex items-center justify-between gap-2">
                      <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArchivo(idx)}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tamaño máximo 10 MB por archivo.
              </p>
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
