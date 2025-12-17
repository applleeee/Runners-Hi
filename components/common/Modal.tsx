"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  header?: string;
  children: ReactNode;
  confirmText: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  header,
  children,
  confirmText,
  onConfirm,
  isLoading = false,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-sm"
        showCloseButton={false}
      >
        {header ? (
          <DialogHeader className="-mx-6 -mt-6 rounded-t-lg bg-(--sub-color) px-6 py-3">
            <DialogTitle className="text-base font-bold text-(--black)">
              {header}
            </DialogTitle>
          </DialogHeader>
        ) : (
          <DialogTitle className="sr-only">확인</DialogTitle>
        )}

        <div className={header ? "" : "pt-2"}>{children}</div>

        <DialogFooter className="mt-4 flex gap-2 sm:gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg bg-(--unselect) py-2.5 text-sm font-semibold text-white"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-lg bg-(--key-color) py-2.5 text-sm font-semibold text-(--black) disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? `${confirmText} 중...` : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
