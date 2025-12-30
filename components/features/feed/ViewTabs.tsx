"use client";

import { ViewMode } from "@/lib/hooks/feed/useFeed";

interface ViewTabsProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewTabs({ viewMode, onChange }: ViewTabsProps) {
  return (
    <div className="flex w-full rounded-full bg-[#DFFFD5] p-1">
      <button
        type="button"
        onClick={() => onChange("map")}
        className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          viewMode === "map"
            ? "bg-[#06F712] text-black"
            : "text-black/60 hover:text-black"
        }`}
      >
        MAP
      </button>
      <button
        type="button"
        onClick={() => onChange("card")}
        className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          viewMode === "card"
            ? "bg-[#06F712] text-black"
            : "text-black/60 hover:text-black"
        }`}
      >
        CARD
      </button>
    </div>
  );
}
