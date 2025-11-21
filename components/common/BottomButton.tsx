"use client";

import { cn } from "@/lib/utils";

interface BottomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "unselect";
  className?: string;
}

export function BottomButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "unselect",
  className,
}: BottomButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-14 w-full cursor-pointer text-xl font-semibold leading-none text-white",
        variant === "primary" && "bg-(--key-color)",
        variant === "unselect" && "bg-(--unselect) disabled:opacity-50",
        disabled && "cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
