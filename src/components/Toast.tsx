import { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
};

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="size-5 text-green-600" />,
    error: <AlertCircle className="size-5 text-red-600" />,
    info: <Info className="size-5 text-blue-600" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5 ${colors[type]} border rounded-lg shadow-lg p-4 pr-12 max-w-md`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <p className="text-sm flex-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
