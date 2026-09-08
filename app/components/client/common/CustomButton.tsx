"use client";

import Link from "next/link";
import Image from "next/image";
import { useLenis } from "../layout/LenisProvider";

interface CustomButtonProps {
  type?: "button" | "submit" | "reset";
  text: string;
  link?: string;
  btnClass?: string;
  txtClass?: string;
  imageClass?: string;
  variant?: "1" | "2" | "3";
  iconDirection?: "default" | "down";
  onClick?: () => void;
  showIcon?: boolean;
}

export default function CustomButton({
  type = "button",
  text,
  link,
  btnClass = "",
  txtClass = "",
  imageClass = "",
  variant = "1",
  iconDirection = "default",
  onClick,
  showIcon = true,
}: CustomButtonProps) {
  const { scrollTo } = useLenis();

  const isHashLink = link?.startsWith("#") && link.length > 1;
  const isFileLink = link ? /\.(pdf|docx?|xlsx?|zip|csv)$/i.test(link) : false;

  const handleClick = () => {
    if (isHashLink) {
      const el = document.getElementById(link!.slice(1));
      if (el) {
        scrollTo(el, { offset: 0 });
        window.history.pushState(null, "", link);
      }
    }
    onClick?.();
  };

  const variantStyles = {
    "1": {
      button: "border-secondary text-white hover:text-black",
      icon: "invert brightness-0 group-hover/button:invert-0 group-hover/button:brightness-100",
      fill: "#fff",
    },
    "2": {
      button:
        "border-secondary bg-transparent text-description-color hover:text-white",
      icon: "invert-0 brightness-100 group-hover/button:invert group-hover/button:brightness-0",
      fill: "var(--primary)",
    },
    "3": {
      button: "border-secondary bg-primary text-white hover:text-primary",
      icon: "invert brightness-0 group-hover/button:invert-0 group-hover/button:brightness-100",
      fill: "#fff",
    },
  };

  const iconRotation =
    iconDirection === "down" ? "rotate-135" : "group-hover/button:rotate-45";

  const sharedClassName = `btn-fill-center cursor-pointer group/button flex items-center justify-center gap-4 max-h-9.25 md:max-h-10.5 rounded-[50px] border px-4.5 md:px-5.5 py-[11.5px] md:py-3.5 transition-colors duration-500 ${variantStyles[variant].button} ${btnClass}`;
  const sharedStyle = {
    "--fill-color": variantStyles[variant].fill,
  } as React.CSSProperties;

  const content = (
    <>
      <span
        className={`mt-1 text-15 leading-none uppercase font-itc-medium whitespace-nowrap ${txtClass}`}
      >
        {text}
      </span>

      {showIcon && (
        <Image
          src="/assets/icons/right-top-arrow-primary.svg"
          alt="arrow-top-right"
          width={14}
          height={14}
          className={`pointer-events-none transition-all duration-500 ${variantStyles[variant].icon} ${iconRotation} ${imageClass}`}
        />
      )}
    </>
  );

  if (!link) {
    return (
      <button
        type={type as "button" | "submit" | "reset"}
        onClick={handleClick}
        className={sharedClassName}
        style={sharedStyle}
      >
        {content}
      </button>
    );
  }

  if (isHashLink) {
    return (
      <a
        href={link}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        className={sharedClassName}
        style={sharedStyle}
      >
        {content}
      </a>
    );
  }

  if (isFileLink) {
    return (
      <a
        href={link}
        download
        onClick={onClick}
        className={sharedClassName}
        style={sharedStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={link}
      onClick={handleClick}
      className={sharedClassName}
      style={sharedStyle}
    >
      {content}
    </Link>
  );
}
