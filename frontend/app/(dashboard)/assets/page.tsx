"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import GlobalSearch from "@/components/GlobalSearch";

interface EmployeeBrief {
  id: number;
  name: string;
  employee_id: string;
  email: string;
}

interface Asset {
  id: number;
  tag: string;
  type: string;
  make_model: string;
  serial_number: string;
  purchase_date: string;
  condition: string;
  status: string;
  current_holder?: EmployeeBrief | null;
}

interface PaginatedResponse {
  items: Asset[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const STATUS_OPTIONS = [
  "All statuses",
  "Ready to assign",
  "Assigned",
  "In repair",
  "Working",
  "Hardware issue",
  "Shipped to",
  "Retired",
];

const TYPE_OPTIONS = ["All types", "Laptop", "Monitor", "Phone", "Docks & peripherals"];

const CONDITION_OPTIONS = ["Any condition", "New", "Good", "Fair", "Poor"];

function formatAssetAge(dateStr?: string) {
  if (!dateStr) return "—";
  const purchase = new Date(dateStr);
  const now = new Date();
  let months = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) return `${years}y ${remainingMonths}m`;
  if (years > 0) return `${years}y`;
  if (remainingMonths > 0) return `${remainingMonths}m`;
  return "< 1m";
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function AssetsPage() {
    const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [type, setType] = useState("All types");
  const [condition, setCondition] = useState("Any condition");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: pageSize };
      if (search.trim()) params.q = search.trim();
      if (status !== "All statuses") params.status = status;
      if (type !== "All types") params.type = type;
      if (condition !== "Any condition") params.condition = condition;

      const res = await api.get<PaginatedResponse>("/api/assets", { params });
      let items = res.data.items;

      setAssets(items);
      setTotalPages(res.data.total_pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status, type, condition]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("All statuses");
    setType("All types");
    setCondition("Any condition");
    setPage(1);
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Assigned":
        return {
          badge: "bg-[#e8f1fd] text-[#2563eb]",
          dot: "bg-[#2563eb]",
          label: "Assigned",
        };
      case "Ready to assign":
      case "Working":
        return {
          badge: "bg-[#e6f7f2] text-[#0d9488]",
          dot: "bg-[#0d9488]",
          label: st === "Ready to assign" ? "Ready assign" : "Working",
        };
      case "In repair":
        return {
          badge: "bg-[#fef3e2] text-[#d97706]",
          dot: "bg-[#d97706]",
          label: "In repair",
        };
      case "Hardware issue":
        return {
          badge: "bg-[#fdeeed] text-[#e11d48]",
          dot: "bg-[#e11d48]",
          label: "Hardware issue",
        };
      default:
        return {
          badge: "bg-slate-100 text-slate-600",
          dot: "bg-slate-400",
          label: st,
        };
    }
  };

  const startRecord = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Assets
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Filter, search and drill in
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/assets/new"
            className="flex items-center gap-1.5 rounded-lg bg-[#0e746b] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0b5f58] transition"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Add asset
          </Link>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[300px]">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by tag, model or serial..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-300"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-normal text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Type Dropdown */}
        <div className="relative">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-normal text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Condition Dropdown */}
        <div className="relative">
          <select
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-normal text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
          >
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        <button
          onClick={handleClearFilters}
          className="text-xs text-slate-400 hover:text-slate-600 transition px-2 py-1"
        >
          Clear
        </button>
      </div>

      {/* Main Asset Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <th className="py-3 px-5 font-normal">TAG</th>
              <th className="py-3 px-5 font-normal">ASSET</th>
              <th className="py-3 px-5 font-normal">SERIAL</th>
              <th className="py-3 px-5 font-normal">ASSIGNED TO</th>
              <th className="py-3 px-5 font-normal">CONDITION</th>
              <th className="py-3 px-5 font-normal">AGE</th>
              <th className="py-3 px-5 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <Loader2 className="inline-block h-4 w-4 animate-spin mr-2 text-teal-700" />
                  Loading assets...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400 font-normal">
                  No assets found matching the selected filters.
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const statusMeta = getStatusBadge(asset.status);
                return (
                  <tr
                    key={asset.id}
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    className="hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {asset.tag}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-900 text-xs leading-tight">
                        {asset.make_model}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        {asset.type}
                      </p>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-500 uppercase">
                      {asset.serial_number}
                    </td>
                    <td className="py-4 px-5">
                      {asset.current_holder ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#e6f4f2] text-[10px] font-bold text-[#0d9488]">
                            {getInitials(asset.current_holder.name)}
                          </span>
                          <span className="font-medium text-slate-800 text-xs">
                            {asset.current_holder.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-normal pl-2">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-700 text-xs">
                      {asset.condition || "Good"}
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-xs whitespace-nowrap">
                      {formatAssetAge(asset.purchase_date)}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusMeta.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <p>
              Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{" "}
              <span className="font-semibold text-slate-800">{endRecord}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalCount}</span> assets
            </p>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 outline-none"
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 mr-1">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}