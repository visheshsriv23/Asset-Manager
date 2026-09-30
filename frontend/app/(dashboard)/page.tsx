"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { DashboardStatsResponse, RecentActivityItem } from "@/types/dashboard";
import GlobalSearch from "@/components/GlobalSearch";
import DashboardAlerts from "@/components/DashboardAlerts";
import DashboardCharts from "@/components/DashboardCharts";

const STATUS_BADGE_STYLES: Record<
  string,
  { bg: string; border: string; text: string; dot: string; bar: string }
> = {
  "Ready to assign": {
    bg: "bg-emerald-50",
    border: "border-emerald-200/80",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-[#008b7a]",
  },
  "Assigned": {
    bg: "bg-blue-50",
    border: "border-blue-200/80",
    text: "text-blue-700",
    dot: "bg-blue-500",
    bar: "bg-blue-600",
  },
  "In repair": {
    bg: "bg-amber-50",
    border: "border-amber-200/80",
    text: "text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  "Hardware issue": {
    bg: "bg-rose-50",
    border: "border-rose-200/80",
    text: "text-rose-700",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  "Shipped": {
    bg: "bg-purple-50",
    border: "border-purple-200/80",
    text: "text-purple-700",
    dot: "bg-purple-500",
    bar: "bg-purple-500",
  },
  "Retired": {
    bg: "bg-slate-100",
    border: "border-slate-200/80",
    text: "text-slate-600",
    dot: "bg-slate-400",
    bar: "bg-slate-500",
  },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any>(null);
  const [chartsData, setChartsData] = useState<{ status_distribution: any[]; type_over_time: any[] } | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, activityRes, chartsRes] = await Promise.all([
          api.get<DashboardStatsResponse>("/api/dashboard/stats"),
          api.get<RecentActivityItem[]>("/api/dashboard/recent-activity"),
          api.get("/api/dashboard/charts-data"),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setChartsData(chartsRes.data);
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
    <div className="space-y-7 max-w-7xl mx-auto bg-white-700 mb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 flex py-4 -mx-5 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white">
        <div>
          <h1 className="text-xl px-5 font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs px-5 text-slate-500 mt-0.5 font-normal">
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
      <hr className="border-slate-200" />

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Ready to assign */}
        <div className="flex h-25 flex-col justify-between rounded-xl bg-[#0e746b] p-4 text-white shadow-sm">
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
        <div className="flex h-25 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Assigned
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.assigned ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">in employees&apos; hands</p>
        </div>

        {/* In repair */}
        <div className="flex h-25 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            In repair
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.in_repair ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">out with vendors</p>
        </div>

        {/* Hardware issue */}
        <div className="flex h-25 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Hardware issue
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.hardware_issue ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">needs attention</p>
        </div>

        {/* Total assets */}
        <div className="flex h-25 flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Total assets
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {stats?.total_assets ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">across all statuses</p>
        </div>
      </div>

      <DashboardAlerts alerts={alerts} />

      {/* Two Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assets by status */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-slate-300">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Assets by status
            </h2>
            <Link href="/assets" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3.5 pt-2 divide-y divide-slate-300">
            {stats?.by_status?.map((item: any, idx: number) => {
              const style = STATUS_BADGE_STYLES[item.status] || {
                bg: "bg-slate-50",
                border: "border-slate-200",
                text: "text-slate-700",
                dot: "bg-slate-400",
                bar: "bg-slate-500",
              };

              return (
                <div
                  key={item.status || idx}
                  className="flex items-center justify-between gap-4 text-xs"
                >
                  {/* Pill Badge Container with border, tinted background, dot, and text */}
                  <div className="w-36 shrink-0 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium leading-none ${style.bg} ${style.border} ${style.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
                      <span className="truncate">{item.status}</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                      style={{
                        width: `${Math.min(
                          100,
                          ((item.count || 0) / (stats?.total_assets || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Count */}
                  <span className="w-6 text-right font-semibold text-slate-800">
                    {item.count}
                  </span>               
                </div>

              );
              <hr className="border-slate-100" />
            })}           
          </div>
        </div>

        {/* Available to assign, by type */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-slate-300">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Available to assign, by type
            </h2>
            <Link href="/assets" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-4 divide-y divide-slate-300">
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
                    <p className="text-sm font-bold text-[#0ea58e] leading-tight">
                    {item.available ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-800">available</p>
                </div>
                </div>
            );
            })}
          </div>
        </div>
      </div>
      {chartsData && (
        <DashboardCharts
          statusData={chartsData.status_distribution}
          timelineData={chartsData.type_over_time}
        />
      )}

      {/* RECENT ACTIVITY CARD */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent activity
            </h2>
          </div>
          <Link
            href="/history"
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition"
          >
            Full history →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {(activity && activity.length > 0
            ? activity
            : []
          ).map((item: any, idx: number) => {
            const act = (item.action || "").toLowerCase();
            let dot = "bg-slate-400";
            if (act.includes("ready")) dot = "bg-emerald-500";
            else if (act.includes("assign")) dot = "bg-blue-500";
            else if (act.includes("repair") || act.includes("issue")) dot = "bg-amber-500";
            else if (act.includes("ship")) dot = "bg-purple-500";
            else if (item.dotColor) dot = item.dotColor;

            return (
              <div key={item.id || idx} className="py-3.5 first:pt-3 last:pb-1">
                <div className="flex items-start gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${dot} mt-1 shrink-0`} />
                  <div className="space-y-0.5 text-xs">
                    <p className="text-slate-700 leading-snug">
                      <span className="font-semibold text-slate-900 font-mono">
                        {item.tag || item.asset_tag || "ASSET"}
                      </span>{" "}
                      {item.model && (
                        <span className="text-slate-500">({item.model}) </span>
                      )}
                      <span className="text-slate-600">
                        {item.action || "updated"}
                      </span>{" "}
                      <span className="font-semibold text-slate-900">
                        {item.target || item.employee_name || item.notes || ""}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-normal">
                      {item.time || item.date || "Recently"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </div>
  );
}