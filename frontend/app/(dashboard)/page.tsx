"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { DashboardStatsResponse, RecentActivityItem } from "@/types/dashboard";
import GlobalSearch from "@/components/GlobalSearch";
import DashboardAlerts from "@/components/DashboardAlerts";

const STATUS_COLORS: Record<string, string> = {
  "Ready to assign": "bg-[#10b981]",
  Assigned: "bg-[#3b82f6]",
  "In repair": "bg-[#f59e0b]",
  "Hardware issue": "bg-[#ef4444]",
  Shipped: "bg-[#a855f7]",
  Retired: "bg-[#64748b]",
  "Shipped/Retired": "bg-[#64748b]",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get<DashboardStatsResponse>("/api/dashboard/stats"),
          api.get<RecentActivityItem[]>("/api/dashboard/recent-activity"),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, activityRes, alertsRes] = await Promise.all([
          api.get("/api/dashboard/stats"),
          api.get("/api/dashboard/recent-activity"),
          api.get("/api/dashboard/alerts"),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Live view of the asset inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlobalSearch />

          <Link
            href="/assets/new"
            className="flex items-center gap-1.5 rounded-lg bg-[#0e746b] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0b5f58] transition"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Add asset
          </Link>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Ready to assign */}
        <div className="flex h-36 flex-col justify-between rounded-xl bg-[#0e746b] p-4 text-white shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Ready to assign
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight">
              {stats?.ready_to_assign ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-emerald-100/70 font-normal">available right now</p>
        </div>

        {/* Assigned */}
        <div className="flex h-36 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Assigned
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.assigned ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">in employees&apos; hands</p>
        </div>

        {/* In repair */}
        <div className="flex h-36 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            In repair
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.in_repair ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">out with vendors</p>
        </div>

        {/* Hardware issue */}
        <div className="flex h-36 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Hardware issue
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.hardware_issue ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">needs attention</p>
        </div>

        {/* Total assets */}
        <div className="flex h-36 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Total assets
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.total_assets ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">across all statuses</p>
        </div>
      </div>

      <DashboardAlerts alerts={alerts} />

      {/* Two Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assets by status */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Assets by status
            </h2>
            <Link href="/assets" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.by_status?.map((item, idx) => {
              const dotColor = STATUS_COLORS[item.status] || "bg-slate-400";
              return (
                <div key={item.status || `status-${idx}`} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 w-28 text-slate-600 font-medium truncate">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
                    <span className="truncate">{item.status}</span>
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-[#edf2f7] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${dotColor}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-800">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available to assign, by type */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Available to assign, by type
            </h2>
            <Link href="/assets" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-4">
          {stats?.by_type?.map((item: any, idx: number) => {
            const typeName = item.asset_type || item.type || `Type ${idx + 1}`;
            return (
                <div key={`type-row-${idx}-${typeName}`} className="flex items-center justify-between gap-4">
                <div className="w-32">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                    {typeName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                    of {item.total ?? 0} total
                    </p>
                </div>
                <div className="h-2 flex-1 rounded-full bg-[#edf2f7] overflow-hidden">
                    <div
                    className="h-full rounded-full bg-[#0ea58e] transition-all duration-500"
                    style={{ width: `${item.percentage ?? 0}%` }}
                    />
                </div>
                <div className="w-14 text-right">
                    <p className="text-sm font-bold text-slate-800 leading-tight">
                    {item.available ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-400">available</p>
                </div>
                </div>
            );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent activity
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Latest assignments, returns, and status updates
            </p>
          </div>
          <Link
            href="/history"
            className="text-xs font-medium text-slate-500 hover:text-teal-700 transition flex items-center gap-1"
          >
            Full history &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pt-1">Date</th>
                <th className="pb-3 pt-1">Asset</th>
                <th className="pb-3 pt-1">Action</th>
                <th className="pb-3 pt-1">Employee</th>
                <th className="pb-3 pt-1">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <Loader2 className="inline-block h-4 w-4 animate-spin mr-2 text-teal-700" />
                    Loading metrics...
                  </td>
                </tr>
              ) : activity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No activity recorded yet. Events will appear here as assets are assigned or returned.
                  </td>
                </tr>
              ) : (
                activity.map((item, idx) => (
                  <tr key={item.id ?? `activity-${idx}`} className="hover:bg-slate-50/75 transition">
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 font-medium text-slate-800">
                      {item.asset_name}{" "}
                      <span className="font-mono text-[10px] text-slate-400">
                        ({item.asset_tag})
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.action === "Assigned"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.action === "Returned"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700">
                      {item.employee_name || "—"}
                    </td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}