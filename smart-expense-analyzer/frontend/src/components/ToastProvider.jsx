import { CheckCircle2, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, variant = "success") => {
      const id = ++idRef.current;
      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white animate-[fadeIn_0.15s_ease-out] ${
              t.variant === "error" ? "bg-danger-500" : "bg-ink"
            }`}
          >
            {t.variant === "error" ? (
              <XCircle size={16} className="shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="shrink-0 text-brand-400" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
