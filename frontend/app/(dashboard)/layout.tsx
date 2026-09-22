"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  Users,
  Plus,
  LogOut,
  Box,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: Laptop },
  { href: "/employees", label: "Employees", icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#072523]">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f3f5f8] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col justify-between bg-[#082a27] p-4 text-white">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d6e66] text-emerald-300 shadow-sm">
              <Box className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white leading-none">
                AssetDesk
              </h2>
              <p className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase mt-1">
                ABM • INTERNAL
              </p>
            </div>
          </div>

          {/* Manage Navigation */}
          <div className="mb-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200/40 mb-2">
              Manage
            </p>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                      isActive
                        ? "bg-[#0ea58e] text-white shadow-sm"
                        : "text-emerald-100/70 hover:bg-[#0c3935] hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200/40 mb-2">
              Actions
            </p>
            <Link
              href="/assets/new"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-100/70 hover:bg-[#0c3935] hover:text-white transition-all"
            >
              <Plus className="h-4 w-4" />
              Add asset
            </Link>
          </div>
        </div>

        {/* User Badge */}
        <div className="flex items-center justify-between border-t border-emerald-900/50 pt-3 px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d5952] text-[10px] font-bold text-emerald-200">
              OP
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">
                Ops Admin
              </p>
              <p className="text-[10px] text-emerald-400/80">
                ops@abmtech.com
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-md p-1.5 text-emerald-300/60 hover:bg-[#0c3935] hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto px-8 py-7">{children}</main>
    </div>
  );
}