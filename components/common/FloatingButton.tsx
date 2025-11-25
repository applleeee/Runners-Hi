"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

interface FloatingButtonProps {
  href: string;
  label: string;
}

export function FloatingButton({ href, label }: FloatingButtonProps) {
  return (
    <Link
      href={href}
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-(--key-color) px-6 py-3 font-semibold text-(--black) shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <Pencil className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
