"use client";

import { useEffect, useRef, useState } from "react";

interface FilterOption {
  label: string;
  value: string | number | null;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  variant?: "default" | "compact";
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "선택",
  variant = "default",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 현재 선택된 옵션의 라벨 찾기
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const isCompact = variant === "compact";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          isCompact
            ? "flex items-center gap-1 border-b border-(--black) pb-1 text-sm"
            : "flex w-full items-center justify-between rounded-full border border-gray-300 bg-white px-4 py-2 text-sm relative"
        }
      >
        <span
          className={
            isCompact
              ? "text-(--black)"
              : value === null
              ? "text-(--sub-text) absolute left-1/2 -translate-x-1/2"
              : "text-(--black) absolute left-1/2 -translate-x-1/2"
          }
        >
          {displayLabel}
        </span>
        <span
          className={`text-sm transition-transform shrink-0 ${
            isCompact ? "text-(--black)" : "text-(--sub-text)"
          } ${isCompact ? "" : "ml-auto"} ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full z-50 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${
            isCompact ? "right-0 min-w-[140px]" : "left-0 w-full"
          }`}
        >
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                option.value === value
                  ? "bg-(--sub-color) font-semibold text-(--black)"
                  : "text-(--black)"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
