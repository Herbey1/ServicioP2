"use client"

import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon
} from "./Icons";

const toastConfig = {
  info: {
    bgClass: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    textClass: "text-blue-800 dark:text-blue-200",
    iconClass: "text-blue-500 dark:text-blue-400",
    icon: InformationCircleIcon
  },
  success: {
    bgClass: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    textClass: "text-green-800 dark:text-green-200",
    iconClass: "text-green-500 dark:text-green-400",
    icon: CheckCircleIcon
  },
  error: {
    bgClass: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    textClass: "text-red-800 dark:text-red-200",
    iconClass: "text-red-500 dark:text-red-400",
    icon: XCircleIcon
  },
  warning: {
    bgClass: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    textClass: "text-yellow-800 dark:text-yellow-200",
    iconClass: "text-yellow-500 dark:text-yellow-400",
    icon: ExclamationTriangleIcon
  }
};

function ToastProgress({ timeout, closing, type }) {
  const [width, setWidth] = useState("100%");
  
  const progressColors = {
    info: "bg-blue-500 dark:bg-blue-400",
    success: "bg-green-500 dark:bg-green-400",
    error: "bg-red-500 dark:bg-red-400",
    warning: "bg-yellow-500 dark:bg-yellow-400"
  };

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
      className={`absolute left-0 bottom-0 h-1 ${progressColors[type] || progressColors.info}`}
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
  
  return (
    <div 
      className="fixed z-[9999] top-4 right-4 flex flex-col gap-3 max-w-sm w-[380px] pointer-events-none" 
      role="region" 
      aria-live="polite" 
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => {
        const config = toastConfig[toast.type] || toastConfig.info;
        const Icon = config.icon;
        
        return (
          <div
            key={toast.id}
            className={`
              relative overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-sm
              transition-all duration-300 ease-out transform pointer-events-auto
              ${config.bgClass}
              ${toast.closing 
                ? "opacity-0 translate-x-full scale-95" 
                : "opacity-100 translate-x-0 scale-100"
              }
            `}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 ${config.iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-relaxed ${config.textClass}`}>
                  {toast.message}
                </p>
              </div>
              
              {/* Close button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className={`
                  flex-shrink-0 ml-2 rounded-md p-1 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 
                  transition-all duration-200
                  ${config.iconClass} hover:opacity-75 focus:ring-current focus:ring-offset-transparent
                `}
                aria-label="Cerrar notificación"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Progress bar */}
            <ToastProgress 
              timeout={toast.timeout} 
              closing={toast.closing} 
              type={toast.type}
            />
          </div>
        );
      })}
    </div>
  );
}
