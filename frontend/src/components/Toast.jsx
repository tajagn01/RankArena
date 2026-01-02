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
    <div className="fixed z-50 left-1/2 -translate-x-1/2 bottom-20 w-[calc(100vw-2rem)] max-w-sm md:top-20 md:bottom-auto md:w-auto">
      <div
        className={`px-4 md:px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 ease-out w-full ${
          visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 md:-translate-y-4 translate-y-4 scale-95'
        } ${
          type === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-green-500/20 border-green-500/30 text-green-400'
        }`}
      >
        <p className="text-sm font-medium text-center">{message}</p>
      </div>
    </div>
  );
}
