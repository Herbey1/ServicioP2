"use client";

import PropTypes from "prop-types";

function Entry({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-base font-semibold text-gray-900 break-words">{value || "—"}</span>
    </div>
  );
}

export default function ProfileDetailsModal({ open, onClose, profile }) {
  if (!open || !profile) return null;

  const fields = [
    { label: "Nombre", value: profile.nombre },
    { label: "Correo institucional", value: profile.correo },
    {
      label: "Rol",
      value: profile.rol === "ADMIN" ? "Administrativo" : "Docente",
    },
    { label: "Teléfono", value: profile.telefono },
    { label: "Departamento / Programa", value: profile.departamento },
    { label: "Categoría", value: profile.categoria },
    {
      label: "Estado",
      value: profile.deleted_at ? "Suspendido" : "Activo",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Perfil del usuario</h3>
            <p className="text-sm text-gray-500">
              Información registrada en el sistema para esta cuenta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map(({ label, value }) => (
            <Entry key={label} label={label} value={value} />
          ))}
        </div>
      </div>
    </div>
  );
}

ProfileDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    id: PropTypes.string,
    nombre: PropTypes.string,
    correo: PropTypes.string,
    rol: PropTypes.string,
    telefono: PropTypes.string,
    departamento: PropTypes.string,
    categoria: PropTypes.string,
    deleted_at: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.oneOf([null]),
    ]),
  }),
};
