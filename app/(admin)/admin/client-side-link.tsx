"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { memo } from "react";
import { MdExpandCircleDown } from "react-icons/md";

interface ClientSideLinkProps {
  href: string;
  name: string;
  icon: React.ReactNode;
  className?: string;
  children?: { href: string; name: string }[];
  isOpen?: boolean;
  setOpenLink?: (href: string | null) => void;
  hasChild?: boolean;
  isActiveOverride?: boolean;
}

function ClientSideLink({
  href,
  name,
  icon,
  className,
  children,
  isOpen = false,
  setOpenLink,
  hasChild = false,
  isActiveOverride,
}: ClientSideLinkProps) {
  const pathname = usePathname();

  const isActive =
    isActiveOverride ?? (pathname === href || pathname?.startsWith(`${href}/`));

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/admin/login";
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Link
        href={href == "/admin/logout" ? "#" : href}
        onClick={() => {
          setOpenLink?.(isOpen ? null : href);
          if (href === "/admin/logout") {
            handleLogout();
            return;
          }
        }}
        className={cn(
          "flex items-center px-4 py-3 transition-colors font-itc-medium justify-between",
          " hover:text-white btn-fill-center",
          isActive
            ? "bg-primary text-white"
            : "text-description-color bg-white",
          className,
        )}
        style={{ "--fill-color": "#0A0A0A" } as React.CSSProperties}
      >
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          {name}
        </div>
        {hasChild &&
          (!isOpen ? (
            <MdExpandCircleDown className="ml-1 mt-1" />
          ) : (
            <MdExpandCircleDown className="ml-1 mt-1 rotate-180" />
          ))}
      </Link>
      {isOpen && children && (
        <div className="flex pl-14 flex-col items-start gap-2">
          {children.map((item, index) => {
            const isChildActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-2 h-1 rounded-full",
                    isChildActive ? "bg-primary" : "bg-description-color/70",
                  )}
                />
                <Link
                  href={item.href}
                  className={cn(
                    "w-full rounded-[5px] font-itc-medium flex items-center justify-center cursor-pointer text-[15px] px-2 py-3 transition-colors",
                    isChildActive
                      ? "text-primary"
                      : "text-description-color/70",
                  )}
                >
                  <span className="text-trim">{item.name}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default memo(ClientSideLink);
