"use client"

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../../context/ThemeContext";
import { useToast } from "../../../context/ToastContext";

const DOMAIN_SUFFIX = "@uabc.edu.mx";
const DOMAIN_ERROR = `El correo debe pertenecer al dominio ${DOMAIN_SUFFIX}`;

const MAX_NAME = 120;
const MAX_PHONE = 40;
const MAX_DEPARTMENT = 180;
const MAX_CATEGORY = 120;

export default function AddDocenteModal({ isOpen, onClose, onSubmit, submitting = false }) {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("DOCENTE");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [categoria, setCategoria] = useState("");

  const [nombreTouched, setNombreTouched] = useState(false);
  const [correoTouched, setCorreoTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [telefonoTouched, setTelefonoTouched] = useState(false);
  const [departamentoTouched, setDepartamentoTouched] = useState(false);
  const [categoriaTouched, setCategoriaTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNombre("");
      setCorreo("");
      setRol("DOCENTE");
      setPassword("");
      setTelefono("");
      setDepartamento("");
      setCategoria("");
      setNombreTouched(false);
      setCorreoTouched(false);
      setPasswordTouched(false);
      setTelefonoTouched(false);
      setDepartamentoTouched(false);
      setCategoriaTouched(false);
    }
  }, [isOpen]);

  const validation = useMemo(() => {
    const trimmedName = nombre.trim();
    const trimmedEmail = correo.trim();
    const trimmedPassword = password.trim();
    const trimmedTelefono = telefono.trim();
    const trimmedDepartamento = departamento.trim();
    const trimmedCategoria = categoria.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let correoError = null;
    if (!trimmedEmail) {
      correoError = "Ingrese el correo electrónico";
    } else if (!emailRegex.test(trimmedEmail)) {
      correoError = "Ingrese un correo electrónico válido";
    } else if (!trimmedEmail.toLowerCase().endsWith(DOMAIN_SUFFIX)) {
      correoError = DOMAIN_ERROR;
    }

    return {
      nombre: !trimmedName
        ? "Ingrese el nombre del usuario"
        : trimmedName.length > MAX_NAME
        ? `El nombre supera ${MAX_NAME} caracteres`
        : null,
      correo: correoError,
      password:
        trimmedPassword.length < 8
          ? "La contraseña debe tener al menos 8 caracteres"
          : null,
      telefono:
        trimmedTelefono.length > MAX_PHONE
          ? `El teléfono supera ${MAX_PHONE} caracteres`
          : null,
      departamento:
        trimmedDepartamento.length > MAX_DEPARTMENT
          ? `El departamento supera ${MAX_DEPARTMENT} caracteres`
          : null,
      categoria:
        trimmedCategoria.length > MAX_CATEGORY
          ? `La categoría supera ${MAX_CATEGORY} caracteres`
          : null,
    };
  }, [nombre, correo, password, telefono, departamento, categoria]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    setNombreTouched(true);
    setCorreoTouched(true);
    setPasswordTouched(true);
    setTelefonoTouched(true);
    setDepartamentoTouched(true);
    setCategoriaTouched(true);

    if (
      validation.nombre ||
      validation.correo ||
      validation.password ||
      validation.telefono ||
      validation.departamento ||
      validation.categoria
    ) {
      if (validation.correo === DOMAIN_ERROR) {
        showToast("Solo se permiten correos institucionales @uabc.edu.mx", { type: "error" });
      }
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      correo: correo.trim(),
      rol,
      password: password.trim(),
      telefono: telefono.trim(),
      departamento: departamento.trim(),
      categoria: categoria.trim(),
    });
  };

  const disableSubmit =
    submitting ||
    Boolean(
      validation.nombre ||
      validation.correo ||
      validation.password ||
      validation.telefono ||
      validation.departamento ||
      validation.categoria
    );

  const handleOverlayClick = () => {
    if (!submitting) onClose();
  };

  const cardClasses = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800";
  const inputClasses = darkMode
    ? "w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
    : "w-full border border-gray-300 bg-white text-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-green-600";

  const renderError = (touched, error) =>
    touched && error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`${cardClasses} w-full max-w-2xl rounded-2xl shadow-lg p-6`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Agregar usuario</h2>
          <button
            type="button"
            onClick={handleOverlayClick}
            disabled={submitting}
            className={`text-2xl leading-none ${
              submitting
                ? "opacity-50 cursor-not-allowed"
                : darkMode
                ? "text-white hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            &times;
          </button>
        </div>

        <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Completa la información para dar de alta un integrante y definir sus permisos iniciales.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="rol-usuario">
                Ocupación
              </label>
              <select
                id="rol-usuario"
                value={rol}
                onChange={(event) => setRol(event.target.value)}
                className={inputClasses}
                disabled={submitting}
              >
                <option value="DOCENTE">Docente</option>
                <option value="ADMIN">Administrativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password-usuario">
                Contraseña temporal
              </label>
              <input
                id="password-usuario"
                type="text"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setPasswordTouched(true)}
                className={inputClasses}
                placeholder="Mínimo 8 caracteres"
                disabled={submitting}
              />
              {renderError(passwordTouched, validation.password)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nombre-docente">
              Nombre completo
            </label>
            <input
              id="nombre-docente"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              onBlur={() => setNombreTouched(true)}
              className={inputClasses}
              placeholder="Ej. María Pérez"
              disabled={submitting}
            />
            {renderError(nombreTouched, validation.nombre)}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="correo-docente">
              Correo electrónico institucional
            </label>
            <input
              id="correo-docente"
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              onBlur={() => setCorreoTouched(true)}
              className={inputClasses}
              placeholder={`Ej. maria.perez${DOMAIN_SUFFIX}`}
              disabled={submitting}
            />
            {renderError(correoTouched, validation.correo)}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="telefono-docente">
                Teléfono
              </label>
              <input
                id="telefono-docente"
                type="text"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                onBlur={() => setTelefonoTouched(true)}
                className={inputClasses}
                placeholder="Opcional"
                disabled={submitting}
              />
              {renderError(telefonoTouched, validation.telefono)}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="departamento-docente">
                Departamento / Programa
              </label>
              <input
                id="departamento-docente"
                type="text"
                value={departamento}
                onChange={(event) => setDepartamento(event.target.value)}
                onBlur={() => setDepartamentoTouched(true)}
                className={inputClasses}
                placeholder="Opcional"
                disabled={submitting}
              />
              {renderError(departamentoTouched, validation.departamento)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="categoria-docente">
              Categoría / Puesto
            </label>
            <input
              id="categoria-docente"
              type="text"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              onBlur={() => setCategoriaTouched(true)}
              className={inputClasses}
              placeholder="Opcional"
              disabled={submitting}
            />
            {renderError(categoriaTouched, validation.categoria)}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleOverlayClick}
              disabled={submitting}
              className={`${
                darkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={disableSubmit}
              className={`bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                disableSubmit ? "opacity-60 cursor-not-allowed" : "hover:bg-green-800"
              }`}
            >
              {submitting ? "Guardando…" : "Guardar usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AddDocenteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};
