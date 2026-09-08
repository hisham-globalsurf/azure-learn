"use client";

import ClientSideLink from "@/app/(admin)/admin/client-side-link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

const AdminNavbar = () => {
  const pathname = usePathname();

  const homeHref = "/admin/home";

  const isActive =
    pathname === homeHref || pathname?.startsWith(`${homeHref}/`);

  return (
    <ClientSideLink
      href={homeHref}
      name="Home"
      icon={<Home className="h-5 w-5" />}
      isOpen={false}
      setOpenLink={() => {}}
      hasChild={false}
      isActiveOverride={isActive}
    />
  );
};

export default AdminNavbar;