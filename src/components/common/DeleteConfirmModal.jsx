"use client"

import PropTypes from "prop-types";

const headerClasses = {
  default: "text-xl font-bold mb-4 text-gray-900",
  danger: "text-xl font-bold mb-4 text-red-600",
};

const confirmClasses = {
  default: "px-5 py-2 bg-green-700 hover:bg-green-800 rounded-full text-white font-medium text-sm transition-colors",
  danger: "px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium text-sm transition-colors",
};

function DeleteConfirmModal({
  show,
  onCancel,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de continuar?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmDisabled = false,
  type = "default",
}) {
  if (!show) return null;
  const typeKey = type === "danger" ? "danger" : "default";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h3 className={headerClasses[typeKey]}>{title}</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`${confirmClasses[typeKey]} ${confirmDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

DeleteConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmDisabled: PropTypes.bool,
  type: PropTypes.oneOf(["default", "danger"]),
};

export default DeleteConfirmModal;
