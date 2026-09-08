import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import ClientSideLink from "../client-side-link";
import AdminNavbar from "@/app/components/admin/AdminNavbar/Index";
import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-cream-background">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col h-screen overflow-y-auto border-r border-secondary">
        <div className="flex-1">
          <Link href="/admin" className="cursor-pointer">
            <div className="px-4 flex flex-col gap-2 bg-white py-30 border-b border-secondary">
              <div className="flex items-center justify-center">
                <Image
                  src="/assets/logos/header-logo.svg"
                  alt="Logo"
                  width={180}
                  height={180}
                />
              </div>
            </div>
          </Link>

          <nav className="space-y-1">
            <AdminNavbar />
          </nav>
        </div>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-secondary rounded-[10px]">
          <ClientSideLink
            href="/admin/logout"
            name="Logout"
            icon={<ArrowRightOnRectangleIcon className="h-5 w-5" />}
            className="text-red-600 hover:text-white rounded-[10px]"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pb-5 mt-15 border-t border-secondary">
        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto mx-8 pt-5 bg-cream-background">
          {children}
        </div>
      </main>
    </div>
  );
}
