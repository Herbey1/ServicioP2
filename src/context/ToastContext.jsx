import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';

const ToastContext = createContext();

const FADE_OUT_MS = 250;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // { id, type, message, timeout, closing }
  const timersRef = useRef(new Map()); // id -> { closeTimer, removeTimer }

  const clearTimers = useCallback((id) => {
    const entry = timersRef.current.get(id);
    if (entry?.closeTimer) clearTimeout(entry.closeTimer);
    if (entry?.removeTimer) clearTimeout(entry.removeTimer);
    timersRef.current.delete(id);
  }, []);

  const finalizeRemove = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
    clearTimers(id);
  }, [clearTimers]);

  const beginClose = useCallback((id) => {
    setToasts((current) => {
      let alreadyClosing = false;
      const next = current.map((toast) => {
        if (toast.id === id) {
          alreadyClosing = toast.closing;
          return { ...toast, closing: true };
        }
        return toast;
      });
      if (!alreadyClosing) {
        const entry = timersRef.current.get(id) ?? {};
        if (entry.closeTimer) {
          clearTimeout(entry.closeTimer);
          entry.closeTimer = null;
        }
        if (!entry.removeTimer) {
          entry.removeTimer = setTimeout(() => finalizeRemove(id), FADE_OUT_MS);
          timersRef.current.set(id, entry);
        }
      }
      return next;
    });
  }, [finalizeRemove]);

  const show = useCallback((message, { type = 'info', timeout = 3000 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => {
      const deduped = t.filter(
        (toast) => !(toast.message === message && toast.type === type && !toast.closing)
      );
      return [...deduped, { id, type, message, timeout, closing: false }];
    });
    if (timeout) {
      const closeTimer = setTimeout(() => beginClose(id), timeout);
      timersRef.current.set(id, { closeTimer, removeTimer: null });
    } else {
      timersRef.current.set(id, { closeTimer: null, removeTimer: null });
    }
  }, [beginClose]);

  const remove = useCallback((id) => beginClose(id), [beginClose]);

  useEffect(() => () => {
    timersRef.current.forEach(({ closeTimer, removeTimer }) => {
      if (closeTimer) clearTimeout(closeTimer);
      if (removeTimer) clearTimeout(removeTimer);
    });
    timersRef.current.clear();
  }, []);

  const value = useMemo(
    () => ({ showToast: show, removeToast: remove, toasts, fadeOutMs: FADE_OUT_MS }),
    [show, remove, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
