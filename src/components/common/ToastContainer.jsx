"use client"

import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext";

const styles = {
  base: "fixed z-50 bottom-4 right-4 flex flex-col gap-2 max-w-sm w-[360px]",
  item: {
    base: "relative rounded shadow px-4 py-3 text-sm border flex items-start gap-2 overflow-hidden transition-all duration-300 ease-out opacity-100 translate-y-0",
    types: {
      info: "bg-gray-800 text-white border-gray-700",
      success: "bg-green-600 text-white border-green-500",
      error: "bg-red-600 text-white border-red-500",
      warning: "bg-yellow-600 text-white border-yellow-500",
    },
  },
};

function ToastProgress({ timeout, closing }) {
  const [width, setWidth] = useState("100%");

  useEffect(() => {
    if (!timeout) return undefined;
    const frame = requestAnimationFrame(() => setWidth("0%"));
    return () => cancelAnimationFrame(frame);
  }, [timeout]);

  useEffect(() => {
    if (closing) {
      setWidth("0%");
    }
  }, [closing]);

  if (!timeout) return null;

  return (
    <div
      className="absolute left-0 bottom-0 h-1 bg-white/60"
      style={{
        width,
        transitionProperty: "width",
        transitionTimingFunction: "linear",
        transitionDuration: `${timeout}ms`,
      }}
    />
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const baseClass = useMemo(() => styles.base, []);
  return (
    <div className={baseClass} role="region" aria-live="polite" aria-label="Notificaciones">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.item.base} ${styles.item.types[t.type] || styles.item.types.info} ${
            t.closing ? "opacity-0 translate-y-2" : ""
          }`}
          role="status"
        >
          <div className="flex-1">{t.message}</div>
          <button aria-label="Cerrar notificación" onClick={() => removeToast(t.id)} className="opacity-80 hover:opacity-100">×</button>
          <ToastProgress timeout={t.timeout} closing={t.closing} />
        </div>
      ))}
    </div>
  );
}
