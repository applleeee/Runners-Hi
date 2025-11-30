"use client";

import { ContentType } from "@/lib/api/content";

interface TypeFilterProps {
  types: ContentType[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function TypeFilter({ types, selectedIds, onChange }: TypeFilterProps) {
  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      // 이미 선택된 경우 제거
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      // 선택되지 않은 경우 추가
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex gap-2">
      {types.map((type) => {
        const isSelected = selectedIds.includes(type.id);
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => handleToggle(type.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-1 py-1 text-xs transition-colors ${
              isSelected
                ? "bg-(--black) text-white"
                : "text-(--sub-text) hover:text-(--black)"
            }`}
          >
            {type.name}
          </button>
        );
      })}
    </div>
  );
}
