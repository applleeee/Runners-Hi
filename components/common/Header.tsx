"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreVertical, X } from "lucide-react";
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
      variant: "close";
      title: string;
      onClose?: () => void;
      className?: string;
    }
  | {
      variant: "back-more";
      title: string;
      onBack?: () => void;
      onEdit?: () => void;
      onDelete?: () => void;
      className?: string;
    };

export function Header(props: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (
      (props.variant === "back" || props.variant === "back-more") &&
      props.onBack
    ) {
      props.onBack();
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    if (props.variant === "close" && props.onClose) {
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

  if (props.variant === "back-more") {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="cursor-pointer absolute right-4 shrink-0"
              aria-label="더보기"
            >
              <MoreVertical className="h-6 w-6 text-(--black)" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={props.onEdit}>수정</DropdownMenuItem>
            <DropdownMenuItem onClick={props.onDelete}>삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
  }

  return null;
}
