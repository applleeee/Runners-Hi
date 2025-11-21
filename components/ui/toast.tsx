"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션 후 제거
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="rounded-xl bg-(--black) px-6 py-4 text-center text-sm font-medium text-white shadow-lg">
        {message}
      </div>
    </div>
  );
}

interface UseToastReturn {
  showToast: (message: string) => void;
  ToastComponent: React.ReactNode;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<{
    message: string;
    id: number;
  } | null>(null);

  const showToast = (message: string) => {
    setToast({ message, id: Date.now() });
  };

  const ToastComponent = toast ? (
    <Toast
      key={toast.id}
      message={toast.message}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}
