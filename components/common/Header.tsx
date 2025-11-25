"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

type HeaderProps =
  | {
      variant: "main";
      onMyClick?: () => void;
    }
  | {
      variant: "back";
      title: string;
      onBack?: () => void;
    }
  | {
      variant: "back-close";
      title: string;
      onBack?: () => void;
      onClose?: () => void;
    }
  | {
      variant: "close";
      title: string;
      onClose?: () => void;
    };

export function Header(props: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (
      (props.variant === "back" || props.variant === "back-close") &&
      props.onBack
    ) {
      props.onBack();
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (
      (props.variant === "back-close" || props.variant === "close") &&
      props.onClose
    ) {
      props.onClose();
    } else {
      router.back();
    }
  };

  const handleMyClick = () => {
    if (props.variant === "main" && props.onMyClick) {
      props.onMyClick();
    } else {
      router.push("/profile");
    }
  };

  if (props.variant === "main") {
    return (
      <header className="relative flex items-center justify-center bg-white px-4 py-4">
        <h1 className="whitespace-nowrap text-lg font-bold text-(--black)">
          러너스 하이
        </h1>
        <button
          type="button"
          onClick={handleMyClick}
          className="absolute right-4 shrink-0 whitespace-nowrap text-base font-medium text-(--black)"
        >
          MY
        </button>
      </header>
    );
  }

  if (props.variant === "back") {
    return (
      <header className="relative flex items-center justify-center bg-white px-4 py-4">
        <button
          type="button"
          onClick={handleBack}
          className="absolute left-4 shrink-0"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-6 w-6 text-(--black)" />
        </button>
        <h1 className="whitespace-nowrap text-lg font-bold text-(--black)">
          {props.title}
        </h1>
      </header>
    );
  }

  if (props.variant === "back-close") {
    return (
      <header className="flex items-center justify-between bg-white px-4 py-4">
        <button
          type="button"
          onClick={handleBack}
          className="mr-4 shrink-0"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-6 w-6 text-(--black)" />
        </button>
        <h1 className="flex-1 truncate text-center text-lg font-medium text-(--black)">
          {props.title}
        </h1>
        <button
          type="button"
          onClick={handleClose}
          className="ml-4 shrink-0"
          aria-label="닫기"
        >
          <X className="h-6 w-6 text-(--black)" />
        </button>
      </header>
    );
  }

  if (props.variant === "close") {
    return (
      <header className="relative flex items-center justify-center bg-white px-4 py-4">
        <h1 className="whitespace-nowrap text-lg font-bold text-(--black)">
          {props.title}
        </h1>
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 shrink-0"
          aria-label="닫기"
        >
          <X className="h-6 w-6 text-(--black)" />
        </button>
      </header>
    );
  }

  return null;
}
