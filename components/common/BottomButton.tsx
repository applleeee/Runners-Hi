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
        "h-12 w-full cursor-pointer text-base font-semibold leading-none",
        variant === "primary" && "bg-(--key-color) text-(--black)",
        variant === "unselect" && "bg-(--unselect) text-white disabled:opacity-50",
        disabled && "cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
