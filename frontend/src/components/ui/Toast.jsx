import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Math.random().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => removeToast(id), duration);
        }
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ message, type, onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const bgColors = {
        success: 'bg-[#1e293b]/90 backdrop-blur-xl border-green-500/30 shadow-glass',
        error: 'bg-[#1e293b]/90 backdrop-blur-xl border-red-500/30 shadow-glass',
        info: 'bg-[#1e293b]/90 backdrop-blur-xl border-blue-500/30 shadow-glass'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            layout
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] ${bgColors[type] || bgColors.info} relative overflow-hidden`}
        >
            {icons[type] || icons.info}
            <p className="text-sm font-medium text-slate-200 flex-1">{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                <X size={16} />
            </button>
        </motion.div>
    );
};
