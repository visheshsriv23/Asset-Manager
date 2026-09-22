"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import GlobalSearch from "@/components/GlobalSearch";

interface CurrentAsset {
  id: number;
  tag: string;
  make_model: string;
  type: string;
  condition: string;
  status: string;
  since?: string;
}

interface PastAsset {
  id: number;
  asset_id: number;
  tag: string;
  make_model: string;
  type: string;
  held_period: string;
  returned_date: string;
  condition_on_return: string;
}

interface EmployeeProfile {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
  current_assets: CurrentAsset[];
  past_assets: PastAsset[];
}

interface AvailableAsset {
  id: number;
  tag: string;
  make_model: string;
  type: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const employeeId = resolvedParams.id;
  const router = useRouter();

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [assignNotes, setAssignNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, assetsRes] = await Promise.all([
        api.get<EmployeeProfile>(`/api/employees/${employeeId}`),
        api.get<{ items: AvailableAsset[] }>("/api/assets", {
          params: { status: "Ready to assign", page_size: 100 },
        }),
      ]);
      setEmployee(empRes.data);
      setAvailableAssets(assetsRes.data.items);
      if (assetsRes.data.items.length > 0) {
        setSelectedAssetId(String(assetsRes.data.items[0].id));
      }
    } catch (err) {
      console.error("Failed to load employee profile:", err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;
    setSubmitting(true);

    try {
      await api.post(`/api/employees/${employeeId}/assign`, {
        asset_id: Number(selectedAssetId),
        effective_date: new Date(effectiveDate).toISOString(),
        notes: assignNotes.trim() || undefined,
      });
      setIsAssignModalOpen(false);
      setAssignNotes("");
      fetchProfile();
    } catch (err) {
      console.error("Failed to assign asset:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-700" />
        Loading employee profile...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-500 text-sm">Employee record not found.</p>
        <Link href="/employees" className="text-xs text-teal-700 underline mt-2 inline-block">
          Return to employees
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Employee</h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">Current and past assets</p>
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
      <Link
        href="/employees"
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
      >
        ‹ Back to employees
      </Link>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e6f4f2] text-sm font-bold text-[#0d9488]">
            {getInitials(employee.name)}
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">{employee.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-normal">
              <span className="font-mono text-slate-500">{employee.employee_id}</span>
              <span>•</span>
              <span className="text-slate-600">{employee.department}</span>
              <span>•</span>
              <span className="font-mono text-slate-500">{employee.email}</span>
              <span>•</span>
              <span className="text-slate-600">{employee.is_active ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="rounded-lg bg-[#0e746b] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0b5f58] transition self-start md:self-auto"
        >
          Assign an asset
        </button>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Currently holding</h3>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5 font-normal">TAG</th>
                <th className="py-3 px-5 font-normal">ASSET</th>
                <th className="py-3 px-5 font-normal">SINCE</th>
                <th className="py-3 px-5 font-normal">CONDITION</th>
                <th className="py-3 px-5 font-normal">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {employee.current_assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-normal">
                    No hardware currently assigned to this employee.
                  </td>
                </tr>
              ) : (
                employee.current_assets.map((asset) => (
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
                    <td className="py-4 px-5 text-slate-600 text-xs">
                      {formatDate(asset.since)}
                    </td>
                    <td className="py-4 px-5 text-slate-700 text-xs">
                      {asset.condition || "Good"}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f1fd] px-2.5 py-0.5 text-[11px] font-medium text-[#2563eb]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900">Past assets</h3>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5 font-normal">TAG</th>
                <th className="py-3 px-5 font-normal">ASSET</th>
                <th className="py-3 px-5 font-normal">HELD</th>
                <th className="py-3 px-5 font-normal">RETURNED</th>
                <th className="py-3 px-5 font-normal">CONDITION ON RETURN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {employee.past_assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-normal">
                    No past assignment history recorded.
                  </td>
                </tr>
              ) : (
                employee.past_assets.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/assets/${item.asset_id}`)}
                    className="hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.tag}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-900 text-xs leading-tight">
                        {item.make_model}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        {item.type}
                      </p>
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-xs">
                      {item.held_period}
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-xs">
                      {formatDate(item.returned_date)}
                    </td>
                    <td className="py-4 px-5 text-slate-700 text-xs">
                      {item.condition_on_return || "Good"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Assign an asset</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                to {employee.name} · {employee.employee_id}
              </p>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available asset
                </label>
                <div className="relative">
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    {availableAssets.length === 0 ? (
                      <option disabled value="">
                        No available assets in stock
                      </option>
                    ) : (
                      availableAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.tag} · {a.make_model}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Effective date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || availableAssets.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e746b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b5f58] transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}