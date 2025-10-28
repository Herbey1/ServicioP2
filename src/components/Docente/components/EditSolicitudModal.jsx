"use client"

import { useId } from "react";
import { API_URL } from "../../../api/client";
import { useTheme } from "../../../context/ThemeContext";

export default function EditSolicitudModal({
  modalEditData,
  setModalEditData,
  handleSaveEdit,
  handleDeleteClick,
  tiposParticipacion,
  programasEducativos,
  onUploadArchivos = () => {},
  onRemoveArchivo = () => {},
  uploadingArchivos = false,
  removingArchivoIds = [],
  viewOnly = false
}) {
  const { darkMode } = useTheme();

  const archivosExistentes = Array.isArray(modalEditData?.archivos) ? modalEditData.archivos : [];
  const removiendo = Array.isArray(removingArchivoIds) ? removingArchivoIds : [];
  const isLoading = !!modalEditData?.loading;
  const isReadOnly = !!viewOnly || isLoading;

  const inputBase = `w-full rounded-lg px-3 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
  const selectBase = inputBase;
  const textareaBase = inputBase;
  const labelClass = `${darkMode ? 'text-gray-200' : 'text-gray-700'}`;
  const helperTextClass = `${darkMode ? 'text-gray-300' : 'text-gray-500'}`;
  const fileInputId = useId();
  const fileButtonBaseClass = "inline-flex items-center justify-center border border-green-700 text-green-700 px-4 py-2 rounded-full text-sm font-medium bg-transparent hover:bg-green-700 hover:text-white transition-colors";
  const fileButtonDisabledClass = "opacity-60 cursor-not-allowed pointer-events-none";
  const tipoParticipacionValue = modalEditData?.tipoParticipacionId ?? "";
  const isOtroTipo = tipoParticipacionValue === "OTHER";

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
      onUploadArchivos(valid);
    }

    event.target.value = "";
  };

  const resolveUrl = (url) => {
    if (!url) return "#";
    if (/^https?:\/\//i.test(url)) return url;
    const base = API_URL?.replace(/\/$/, "") ?? "";
    return `${base}${url}`;
  };

  return (
    modalEditData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-xl shadow-lg w-[800px] max-h-[90vh] overflow-y-auto`}>
          <div className={`flex justify-between items-center mb-6 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-xl font-bold">{viewOnly ? 'Ver solicitud' : 'Editar Solicitud'}</h3>
            <button
              onClick={() => setModalEditData(null)}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Si fue Devuelta, mostrar motivo del administrador */}
          {modalEditData?.comentariosAdmin && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${darkMode ? 'bg-yellow-900 border-yellow-800 text-yellow-100' : 'bg-yellow-50 border border-yellow-200 text-yellow-900'}`}>
              <strong>Motivo de devolución:</strong> {modalEditData.comentariosAdmin}
            </div>
          )}

          {isLoading && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${darkMode ? 'bg-blue-900 border-blue-800 text-blue-100' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
              Cargando información de la solicitud…
            </div>
          )}

          {/* Contenido del modal de edición */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Título de la comisión */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Título de la comisión <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputBase}
                value={modalEditData.titulo ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, titulo: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Solicitante */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Solicitante
              </label>
              <input
                type="text"
                className={`${inputBase} ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                value={modalEditData.solicitante ?? ""}
                disabled
                readOnly
              />
            </div>

            {/* Tipo de participación (selector) */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Tipo de participación <span className="text-red-500">*</span>
              </label>
              <select
                className={selectBase}
                value={tipoParticipacionValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "OTHER") {
                    setModalEditData({ ...modalEditData, tipoParticipacionId: "OTHER" });
                  } else {
                    const parsed = Number.parseInt(value, 10);
                    setModalEditData({
                      ...modalEditData,
                      tipoParticipacionId: Number.isNaN(parsed) ? "" : String(parsed),
                      tipoParticipacionOtro: ""
                    });
                  }
                }}
                disabled={isReadOnly}
                required
              >
                <option value="">Selecciona una opción</option>
                {tiposParticipacion.map(tipo => (
                  <option key={tipo.id} value={String(tipo.id)}>{tipo.nombre}</option>
                ))}
                <option value="OTHER">Otros</option>
              </select>
                {isOtroTipo && (
                <input
                  type="text"
                  className={`${inputBase} mt-2`}
                  value={modalEditData.tipoParticipacionOtro ?? ""}
                    onChange={(e) => setModalEditData({ ...modalEditData, tipoParticipacionOtro: e.target.value })}
                    disabled={isReadOnly}
                  placeholder="Especifica el tipo de participación"
                  required
                />
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputBase}
                value={modalEditData.ciudad ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, ciudad: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* País */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                País <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputBase}
                value={modalEditData.pais ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, pais: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Lugar */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Lugar específico <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputBase}
                value={modalEditData.lugar ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, lugar: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Fechas de salida y regreso */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Fecha de salida <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputBase}
                value={modalEditData.fechaSalida ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, fechaSalida: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Fecha de regreso <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputBase}
                value={modalEditData.fechaRegreso ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, fechaRegreso: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Horas de salida y regreso */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Hora de salida <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={inputBase}
                value={modalEditData.horaSalida ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, horaSalida: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Hora de regreso <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={inputBase}
                value={modalEditData.horaRegreso ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, horaRegreso: e.target.value })}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Número de personas */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Número de personas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className={inputBase}
                value={modalEditData.numeroPersonas ?? ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setModalEditData({ ...modalEditData, numeroPersonas: Number.isNaN(value) ? "" : value });
                }}
                disabled={isReadOnly}
                required
              />
            </div>

            {/* Necesita transporte */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
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
              disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Cantidad de combustible (si necesita transporte) */}
            {modalEditData.necesitaTransporte && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Cantidad de combustible (litros)
                </label>
                <input
                  type="number"
                  min="0"
                  className={inputBase}
                  value={modalEditData.cantidadCombustible ?? ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setModalEditData({ ...modalEditData, cantidadCombustible: Number.isNaN(value) ? "" : value });
                  }}
                  disabled={isReadOnly}
                />
              </div>
            )}

            {/* Programa educativo */}
            <div className={modalEditData.necesitaTransporte ? "col-span-1" : "col-span-2"}>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Programa educativo que apoya <span className="text-red-500">*</span>
              </label>
              <select
                className={selectBase}
                value={modalEditData.programaEducativoId ?? ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setModalEditData({ ...modalEditData, programaEducativoId: Number.isNaN(value) ? null : value });
                }}
                disabled={isReadOnly}
                required
              >
                <option value="">Selecciona una opción</option>
                {programasEducativos.map(programa => (
                  <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                ))}
              </select>
            </div>

            {/* Proyecto de investigación */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Se obtendrá constancia */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
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
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Archivos adjuntos */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Documentación de apoyo (PDF o JPG):
              </label>
              <input
                id={fileInputId}
                type="file"
                className="hidden"
                accept=".pdf,image/jpeg"
                multiple
                onChange={handleFileSelection}
                disabled={uploadingArchivos || isReadOnly}
              />
              <label
                htmlFor={uploadingArchivos || isReadOnly ? undefined : fileInputId}
                className={`${fileButtonBaseClass} ${uploadingArchivos || isReadOnly ? fileButtonDisabledClass : ""}`}
                aria-disabled={uploadingArchivos || isReadOnly}
              >
                Seleccionar archivo
              </label>
              {uploadingArchivos && (
                <p className="text-xs text-gray-500 mt-1">Subiendo archivos…</p>
              )}
              <ul className={`mt-2 space-y-2 text-sm ${helperTextClass}`}>
                {archivosExistentes.map((archivo) => {
                  const archivoUrl = resolveUrl(archivo.url);
                  const eliminando = removiendo.includes(archivo.id);
                  return (
                    <li key={archivo.id} className={`flex items-center justify-between gap-2 rounded px-3 py-2 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100'}`}>
                      <div className="flex-1">
                        <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>{archivo.filename}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {archivo.mime_type} · {Math.round((archivo.bytes || 0) / 1024)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={archivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Ver
                        </a>
                        <button
                          type="button"
                          onClick={() => onRemoveArchivo(archivo)}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
                          disabled={eliminando || isReadOnly}
                        >
                          {eliminando ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </li>
                  );
                })}
                {archivosExistentes.length === 0 && (
                  <li className={`text-xs ${helperTextClass}`}>No hay archivos adjuntos.</li>
                )}
              </ul>
              <p className={`text-xs mt-1 ${helperTextClass}`}>Tamaño máximo 10 MB por archivo.</p>
            </div>

            {/* Comentarios adicionales */}
            <div className="col-span-2">
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Comentarios adicionales
              </label>
              <textarea
                className={textareaBase}
                rows={3}
                value={modalEditData.comentarios ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, comentarios: e.target.value })}
                disabled={isReadOnly}
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
            {!viewOnly && (
              <button
                onClick={handleDeleteClick}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isReadOnly}
              >
                Eliminar solicitud
              </button>
            )}

            {/* Botones de cancelar y guardar en el lado derecho */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalEditData(null)}
                className={`${darkMode ? 'px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white' : 'px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded-full font-medium text-sm`}
              >
                Cancelar
              </button>
              {!viewOnly && (
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isReadOnly || uploadingArchivos}
                >
                  Guardar cambios
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  )
}
