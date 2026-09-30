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
  Layers,
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f6f8] text-slate-800 antialiased">
      {/* 1. Left Sidebar: Fixed width, full screen height, dark */}
      <aside className="w-64 flex-shrink-0 h-screen bg-[#0e1e24] flex flex-col justify-between z-30 select-none">
        <div className="ml-4 mr-2 mt-3">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-2 pt-2">
          <div className="h-9 w-9 rounded-lg bg-[#008b7a] flex items-center justify-center text-white shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-wide">AssetDesk</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              ABM • INTERNAL
            </p>
          </div>
        </div>

          {/* Manage Navigation */}
          <div>
          <p className="px-2 mb-3 mt-10 text-[11px] font-bold uppercase tracking-wider text-[#526f7a]">
            MANAGE
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-[#008b7a] text-white font-semibold shadow-xs"
                      : "text-slate-300 hover:bg-[#142329] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

          {/* Actions */}
          <div>
          <p className="px-2 mb-2 mt-3 text-[11px] font-bold uppercase tracking-wider text-[#526f7a]">
            ACTIONS
          </p>
          <Link
            href="/assets/new"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#142329] hover:text-white transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add asset</span>
          </Link>
        </div>
      </div>

        {/* User Badge */}
        <div className="pt-4 border-t border-[#1a2d35] flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-[#008b7a] flex items-center justify-center mb-5 font-bold text-xs text-white">
            OP
          </div>
          <div className="overflow-hidden mb-5">
            <p className="text-xs font-semibold text-white leading-tight truncate">Ops Admin</p>
            <p className="text-[10px] text-[#63828e] truncate">ops@abmtech.com</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-[#142329] transition cursor-pointer mb-5"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto px-5 ">{children}</main>
    </div>
  );
}