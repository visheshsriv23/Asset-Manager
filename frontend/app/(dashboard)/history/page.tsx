"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Laptop, 
  User, 
  ArrowLeft 
} from "lucide-react";
import { api } from "@/lib/api";
import GlobalSearch from "@/components/GlobalSearch";

interface HistoryRecord {
  id: number;
  asset_id: number;
  asset_tag: string;
  asset_name: string;
  asset_type: string;
  employee_id?: number;
  employee_name?: string;
  employee_code?: string;
  action: string;
  date: string;
  notes?: string;
}

interface HistoryResponse {
  items: HistoryRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const ACTION_FILTERS = ["All", "Assigned", "Returned", "Shipped", "Status", "Updated"];

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDotColor(action: string) {
  const act = action.toLowerCase();
  if (act.includes("assigned")) return "bg-blue-500";
  if (act.includes("ready")) return "bg-emerald-500";
  if (act.includes("return")) return "bg-teal-600";
  if (act.includes("repair")) return "bg-amber-500";
  if (act.includes("issue")) return "bg-rose-500";
  if (act.includes("ship")) return "bg-purple-500";
  return "bg-slate-400";
}

export default function HistoryLogPage() {
  const router = useRouter();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: 15 };
      if (search.trim()) params.q = search.trim();
      if (actionFilter !== "All") params.action_type = actionFilter;

      const res = await api.get<HistoryResponse>("/api/dashboard/history", { params });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Audit & Activity Log
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-normal">
              Complete chronological audit trail across all hardware and employees
            </p>
          </div>
        </div>
        <GlobalSearch />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search action, tag, employee or notes..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-teal-700"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setActionFilter(f);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                actionFilter === f
                  ? "bg-[#0e746b] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <th className="py-3 px-5 font-normal">TIMESTAMP</th>
              <th className="py-3 px-5 font-normal">ASSET</th>
              <th className="py-3 px-5 font-normal">ACTION / EVENT</th>
              <th className="py-3 px-5 font-normal">EMPLOYEE</th>
              <th className="py-3 px-5 font-normal">NOTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-400">
                  <Loader2 className="inline-block h-4 w-4 animate-spin mr-2 text-teal-700" />
                  Loading audit logs...
                </td>
              </tr>
            ) : !data || data.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-400 font-normal">
                  No activity records found matching filters.
                </td>
              </tr>
            ) : (
              data.items.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {formatTimestamp(log.date)}
                  </td>

                  <td className="py-4 px-5">
                    <Link
                      href={`/assets/${log.asset_id}`}
                      className="group flex items-center gap-2"
                    >
                      <Laptop className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 group-hover:text-teal-700 transition">
                          {log.asset_name}
                        </span>
                        <span className="block font-mono text-[10px] text-slate-400">
                          {log.asset_tag} · {log.asset_type}
                        </span>
                      </div>
                    </Link>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${getDotColor(log.action)}`} />
                      <span className="font-medium text-slate-800">{log.action}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    {log.employee_name ? (
                      <Link
                        href={`/employees/${log.employee_id}`}
                        className="flex items-center gap-1.5 text-slate-700 hover:text-teal-700 transition"
                      >
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="font-medium">{log.employee_name}</span>
                        {log.employee_code && (
                          <span className="font-mono text-[10px] text-slate-400">
                            ({log.employee_code})
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-slate-500 max-w-xs truncate">
                    {log.notes || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            <span>
              Showing {((page - 1) * data.page_size) + 1} to{" "}
              {Math.min(page * data.page_size, data.total)} of {data.total} events
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>

              <span className="font-medium text-slate-700 px-1">
                {page} / {data.total_pages}
              </span>

              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}