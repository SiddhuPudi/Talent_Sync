import { useState, useEffect } from "react";

let toastId = 0;
let addToastGlobal = null;

export function useToast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        addToastGlobal = (message, type = "success", duration = 3000) => {
            const id = ++toastId;
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        };
        return () => { addToastGlobal = null; };
    }, []);

    return { toasts, addToast: addToastGlobal };
}

export function showToast(message, type = "success", duration = 3000) {
    if (addToastGlobal) {
        addToastGlobal(message, type, duration);
    }
}

export function ToastContainer({ toasts }) {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`px-5 py-3 rounded-xl shadow-2xl border animate-slide-down flex items-center gap-3 font-medium text-sm backdrop-blur-xl ${
                        toast.type === "success"
                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                            : toast.type === "error"
                            ? "bg-red-500/20 border-red-500/30 text-red-400"
                            : "bg-primary/20 border-primary/30 text-primaryHover"
                    }`}
                >
                    <span className="text-lg">
                        {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
                    </span>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
