import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-lg border-l-4 flex items-center gap-3 animate-fade-in-up cursor-pointer transition-all hover:scale-[1.02]
              ${toast.type === 'success' ? 'bg-white border-green-500 text-slate-800' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-500 text-slate-800' : ''}
              ${toast.type === 'info' ? 'bg-slate-800 border-slate-600 text-white' : ''}
            `}
          >
            <div className={`
                ${toast.type === 'success' ? 'text-green-500' : ''}
                ${toast.type === 'error' ? 'text-red-500' : ''}
                ${toast.type === 'info' ? 'text-blue-400' : ''}
            `}>
                {toast.type === 'success' && <i className="fas fa-check-circle text-xl"></i>}
                {toast.type === 'error' && <i className="fas fa-exclamation-circle text-xl"></i>}
                {toast.type === 'info' && <i className="fas fa-info-circle text-xl"></i>}
            </div>
            <p className="font-medium text-sm">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
