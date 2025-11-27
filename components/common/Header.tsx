"use client";

import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

type HeaderProps =
  | {
      variant: "main";
      onMyClick?: () => void;
      className?: string;
    }
  | {
      variant: "back";
      title: string;
      onBack?: () => void;
      className?: string;
    }
  | {
      variant: "back-close";
      title: string;
      onBack?: () => void;
      onClose?: () => void;
      className?: string;
    }
  | {
      variant: "close";
      title: string;
      onClose?: () => void;
      className?: string;
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
      router.push("/mypage");
    }
  };

  if (props.variant === "main") {
    return (
      <header
        className={`relative flex items-center justify-center bg-white px-4 py-4 ${
          props.className || ""
        }`}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="cursor-pointer whitespace-nowrap text-lg font-bold text-(--black)"
        >
          러너스 하이
        </button>
        <button
          type="button"
          onClick={handleMyClick}
          className="cursor-pointer absolute right-4 shrink-0 whitespace-nowrap text-base font-medium text-(--black)"
        >
          MY
        </button>
      </header>
    );
  }

  if (props.variant === "back") {
    return (
      <header
        className={`relative flex items-center justify-center bg-white px-4 py-4 ${
          props.className || ""
        }`}
      >
        <button
          type="button"
          onClick={handleBack}
          className="cursor-pointer absolute left-4 shrink-0"
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
      <header
        className={`flex items-center justify-between bg-white px-4 py-4 ${
          props.className || ""
        }`}
      >
        <button
          type="button"
          onClick={handleBack}
          className="cursor-pointer mr-4 shrink-0"
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
          className="cursor-pointer ml-4 shrink-0"
          aria-label="닫기"
        >
          <X className="h-6 w-6 text-(--black)" />
        </button>
      </header>
    );
  }

  if (props.variant === "close") {
    return (
      <header
        className={`relative flex items-center justify-center bg-white px-4 py-4 ${
          props.className || ""
        }`}
      >
        <h1 className="whitespace-nowrap text-lg font-bold text-(--black)">
          {props.title}
        </h1>
        <button
          type="button"
          onClick={handleClose}
          className="cursor-pointer absolute right-4 shrink-0"
          aria-label="닫기"
        >
          <X className="h-6 w-6 text-(--black)" />
        </button>
      </header>
    );
  }

  return null;
}
