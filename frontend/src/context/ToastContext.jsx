import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = (message, type = 'success') => { const id = Date.now() + Math.random(); setToasts((current) => [...current, { id, message, type }]); window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500); };
  const value = useMemo(() => ({ show }), []);
  return <ToastContext.Provider value={value}>{children}<div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div className={`toast ${toast.type}`} key={toast.id}>{toast.type === 'success' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}<span>{toast.message}</span><button onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification"><X size={15} /></button></div>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
