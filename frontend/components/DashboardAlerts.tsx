"use client";

import Link from "next/link";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";

export interface WarrantyAlertItem {
  id: number;
  tag: string;
  make_model: string;
  type: string;
  warranty_expiry: string;
  days_left: number;
  is_expired: boolean;
}

export interface OldAssetAlertItem {
  id: number;
  tag: string;
  make_model: string;
  type: string;
  purchase_date: string;
  age_months: number;
}

export interface AlertsProps {
  alerts: {
    expiring_warranty: WarrantyAlertItem[];
    old_assets: OldAssetAlertItem[];
  } | null;
}

export default function DashboardAlerts({ alerts }: AlertsProps) {
  if (!alerts) return null;
  const { expiring_warranty, old_assets } = alerts;

  if (expiring_warranty.length === 0 && old_assets.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/70 to-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 leading-none">
                Warranty Expiry Alert
              </h3>
              <span className="text-[11px] text-amber-700/80">
                {expiring_warranty.length} device{expiring_warranty.length > 1 ? "s" : ""} need renewal attention
              </span>
            </div>
          </div>
          <Link
            href="/assets"
            className="text-[11px] font-medium text-amber-800 hover:text-amber-950 flex items-center gap-0.5"
          >
            All assets <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {expiring_warranty.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No imminent warranty expirations.</p>
        ) : (
          <div className="divide-y divide-amber-100/80">
            {expiring_warranty.map((item) => (
              <Link
                key={item.id}
                href={`/assets/${item.id}`}
                className="group flex items-center justify-between py-2 text-xs hover:bg-amber-50/50 rounded-lg px-2 transition -mx-2"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-800 group-hover:text-amber-900 transition">
                    {item.tag}
                  </span>
                  <span className="text-slate-500 ml-1.5 truncate">
                    {item.make_model}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono ${
                    item.is_expired
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {item.is_expired
                    ? `Expired (${Math.abs(item.days_left)}d ago)`
                    : `${item.days_left}d left`}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-none">
                Aging Hardware ({">"}3 Yrs)
              </h3>
              <span className="text-[11px] text-slate-500">
                {old_assets.length} device{old_assets.length > 1 ? "s" : ""} recommended for replacement cycle
              </span>
            </div>
          </div>
          <Link
            href="/assets"
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
          >
            All assets <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {old_assets.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No aging hardware over 3 years.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {old_assets.map((item) => (
              <Link
                key={item.id}
                href={`/assets/${item.id}`}
                className="group flex items-center justify-between py-2 text-xs hover:bg-slate-50 rounded-lg px-2 transition -mx-2"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-800 group-hover:text-teal-700 transition">
                    {item.tag}
                  </span>
                  <span className="text-slate-500 ml-1.5 truncate">
                    {item.make_model}
                  </span>
                </div>
                <span className="shrink-0 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                  {Math.floor(item.age_months / 12)}y {item.age_months % 12}m
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}