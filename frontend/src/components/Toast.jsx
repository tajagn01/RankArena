import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ease-out ${
          visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 scale-95'
        } ${
          type === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-green-500/20 border-green-500/30 text-green-400'
        }`}
      >
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
