"use client"

import { useToast } from "../../context/ToastContext";

const styles = {
  base: "fixed z-50 bottom-4 right-4 flex flex-col gap-2 max-w-sm w-[360px]",
  item: {
    base: "rounded shadow px-4 py-3 text-sm border flex items-start gap-2",
    types: {
      info: "bg-gray-800 text-white border-gray-700",
      success: "bg-green-600 text-white border-green-500",
      error: "bg-red-600 text-white border-red-500",
      warning: "bg-yellow-600 text-white border-yellow-500",
    },
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className={styles.base} role="region" aria-live="polite" aria-label="Notificaciones">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.item.base} ${styles.item.types[t.type] || styles.item.types.info}`} role="status">
          <div className="flex-1">{t.message}</div>
          <button aria-label="Cerrar notificación" onClick={() => removeToast(t.id)} className="opacity-80 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}

