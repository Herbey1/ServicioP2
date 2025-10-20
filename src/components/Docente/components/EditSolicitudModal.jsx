"use client"

import { useId } from "react";
import { API_URL } from "../../../api/client";

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
  removingArchivoIds = []
}) {
  const archivosExistentes = Array.isArray(modalEditData?.archivos) ? modalEditData.archivos : [];
  const removiendo = Array.isArray(removingArchivoIds) ? removingArchivoIds : [];
  const isLoading = !!modalEditData?.loading;
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

          {isLoading && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
              Cargando información de la solicitud…
            </div>
          )}

          {/* Contenido del modal de edición */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Título de la comisión */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título de la comisión <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.titulo ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, titulo: e.target.value })}
                disabled={isLoading}
                required
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
                value={modalEditData.solicitante ?? ""}
                disabled
                readOnly
              />
            </div>

            {/* Tipo de participación (selector) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de participación <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                disabled={isLoading}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2"
                  value={modalEditData.tipoParticipacionOtro ?? ""}
                  onChange={(e) => setModalEditData({ ...modalEditData, tipoParticipacionOtro: e.target.value })}
                  disabled={isLoading}
                  placeholder="Especifica el tipo de participación"
                  required
                />
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.ciudad ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, ciudad: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.pais ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, pais: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            {/* Lugar */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lugar específico <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.lugar ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, lugar: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            {/* Fechas de salida y regreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de salida <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.fechaSalida ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, fechaSalida: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de regreso <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.fechaRegreso ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, fechaRegreso: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            {/* Horas de salida y regreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de salida <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.horaSalida ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, horaSalida: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de regreso <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.horaRegreso ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, horaRegreso: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            {/* Número de personas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de personas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.numeroPersonas ?? ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setModalEditData({ ...modalEditData, numeroPersonas: Number.isNaN(value) ? "" : value });
                }}
                disabled={isLoading}
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
                    name="necesitaTransporte"
                    checked={modalEditData.necesitaTransporte === true}
                    onChange={() => setModalEditData({ ...modalEditData, necesitaTransporte: true })}
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  value={modalEditData.cantidadCombustible ?? ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setModalEditData({ ...modalEditData, cantidadCombustible: Number.isNaN(value) ? "" : value });
                  }}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Programa educativo */}
            <div className={modalEditData.necesitaTransporte ? "col-span-1" : "col-span-2"}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programa educativo que apoya <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={modalEditData.programaEducativoId ?? ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setModalEditData({ ...modalEditData, programaEducativoId: Number.isNaN(value) ? null : value });
                }}
                disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Archivos adjuntos */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documentación de apoyo (PDF o JPG):
              </label>
              <input
                id={fileInputId}
                type="file"
                className="hidden"
                accept=".pdf,image/jpeg"
                multiple
                onChange={handleFileSelection}
                disabled={uploadingArchivos || isLoading}
              />
              <label
                htmlFor={uploadingArchivos || isLoading ? undefined : fileInputId}
                className={`${fileButtonBaseClass} ${uploadingArchivos || isLoading ? fileButtonDisabledClass : ""}`}
                aria-disabled={uploadingArchivos || isLoading}
              >
                Seleccionar archivo
              </label>
              {uploadingArchivos && (
                <p className="text-xs text-gray-500 mt-1">Subiendo archivos…</p>
              )}
              <ul className="mt-2 space-y-2 text-sm">
                {archivosExistentes.map((archivo) => {
                  const archivoUrl = resolveUrl(archivo.url);
                  const eliminando = removiendo.includes(archivo.id);
                  return (
                    <li key={archivo.id} className="flex items-center justify-between gap-2 bg-gray-100 rounded px-3 py-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{archivo.filename}</p>
                        <p className="text-xs text-gray-500">
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
                          disabled={eliminando || isLoading}
                        >
                          {eliminando ? "Eliminando…" : "Eliminar"}
                        </button>
                      </div>
                    </li>
                  );
                })}
                {archivosExistentes.length === 0 && (
                  <li className="text-xs text-gray-500">No hay archivos adjuntos.</li>
                )}
              </ul>
              <p className="text-xs text-gray-500 mt-1">Tamaño máximo 10 MB por archivo.</p>
            </div>

            {/* Comentarios adicionales */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios adicionales
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                value={modalEditData.comentarios ?? ""}
                onChange={(e) => setModalEditData({ ...modalEditData, comentarios: e.target.value })}
                disabled={isLoading}
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
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
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
                className="px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading || uploadingArchivos}
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
