interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  className = "",
}: PrimaryButtonProps) {
  const baseStyles =
    "rounded-sm bg-(--key-color) px-4 py-2.5 text-xs font-bold text-(--black) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
    >
      {children}
    </button>
  );
}
