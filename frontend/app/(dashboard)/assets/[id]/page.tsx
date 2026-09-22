"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { 
  Search, 
  Plus, 
  Loader2, 
  FileText, 
  Laptop,
  ChevronDown
} from "lucide-react";
import { api } from "@/lib/api";
import GlobalSearch from "@/components/GlobalSearch";

const STATUS_OPTIONS = [
  "Ready to assign",
  "Assigned",
  "Working",
  "In repair",
  "Hardware issue",
  "Shipped to",
  "Retired",
];

const CONDITION_OPTIONS = ["Good", "New", "Fair", "Poor"];

interface EmployeeOption {
  id: number;
  employee_id: string;
  name: string;
  department: string;
}

interface AssignmentHistoryItem {
  id: number;
  action: string;
  date: string;
  notes?: string;
  employee_name?: string;
  employee_code?: string;
}

interface AssetDetail {
  id: number;
  tag: string;
  type: string;
  make_model: string;
  serial_number: string;
  configuration: string;
  purchase_date: string;
  vendor: string;
  invoice_number: string;
  cost: number;
  condition: string;
  status: string;
  location?: string;
  warranty_expiry?: string;
  invoice_file_url?: string;
  current_holder?: {
    id: number;
    name: string;
    employee_id: string;
    email: string;
  } | null;
  history: AssignmentHistoryItem[];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assetId = resolvedParams.id;

  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState("");

  // Change Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Reassign Modal State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [conditionOnReturn, setConditionOnReturn] = useState("Good");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reassignNote, setReassignNote] = useState("");
  const [reassigning, setReassigning] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const [assetRes, empRes] = await Promise.all([
        api.get<AssetDetail>(`/api/assets/${assetId}`),
        api.get<EmployeeOption[]>("/api/employees"),
      ]);
      setAsset(assetRes.data);
      setEmployees(empRes.data);
      setSelectedStatus(assetRes.data.status);
      setSelectedEmployeeId(
        assetRes.data.current_holder ? String(assetRes.data.current_holder.id) : "unassigned"
      );
      setConditionOnReturn(assetRes.data.condition || "Good");
    } catch (err) {
      console.error("Failed to load details:", err);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Handle Change Status
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.post(`/api/assets/${assetId}/status`, {
        status: selectedStatus,
        destination: selectedStatus === "Shipped to" ? destination.trim() : undefined,
        notes: statusNote.trim() || undefined,
      });
      setIsStatusModalOpen(false);
      setStatusNote("");
      setDestination("");
      fetchDetail();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Reassign / Return
  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReassigning(true);
    try {
      await api.post(`/api/assets/${assetId}/reassign`, {
        employee_id: selectedEmployeeId === "unassigned" ? null : Number(selectedEmployeeId),
        condition_on_return: conditionOnReturn,
        effective_date: new Date(effectiveDate).toISOString(),
        notes: reassignNote.trim() || undefined,
      });
      setIsReassignModalOpen(false);
      setReassignNote("");
      fetchDetail();
    } catch (err) {
      console.error("Failed to reassign asset:", err);
    } finally {
      setReassigning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-700" />
        Loading asset details...
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-500 text-sm">Asset record not found.</p>
        <Link href="/assets" className="text-xs text-teal-700 underline mt-2 inline-block">
          Return to assets
        </Link>
      </div>
    );
  }

  const configItems = asset.configuration ? asset.configuration.split(" / ") : [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Asset detail
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Full record and history
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

      <Link
        href="/assets"
        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
      >
        ‹ Back to assets
      </Link>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
            <Laptop className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              {asset.make_model}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-slate-500 font-medium">{asset.tag}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{asset.type}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f1fd] px-2.5 py-0.5 text-[11px] font-medium text-[#2563eb]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                {asset.status}
              </span>
              {asset.current_holder && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#e6f4f2] text-[9px] font-bold text-[#0d9488]">
                      {getInitials(asset.current_holder.name)}
                    </span>
                    <span className="text-slate-700 font-medium">
                      {asset.current_holder.name}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href={`/assets/${asset.id}/edit`}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Edit
          </Link>
          <button
            onClick={() => {
              setSelectedStatus(asset.status);
              setIsStatusModalOpen(true);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Change status
          </button>
          <button
            onClick={() => {
              setSelectedEmployeeId(
                asset.current_holder ? String(asset.current_holder.id) : "unassigned"
              );
              setConditionOnReturn(asset.condition || "Good");
              setIsReassignModalOpen(true);
            }}
            className="rounded-lg bg-[#0e746b] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0b5f58] transition"
          >
            {asset.current_holder ? "Reassign" : "Assign"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Configuration
          </h3>
          <div className="space-y-3 text-xs">
            {configItems.length > 0 ? (
              configItems.map((spec, i) => {
                const parts = spec.split(": ");
                return (
                  <div key={i} className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400">{parts[0] || "Spec"}</span>
                    <span className="font-medium text-slate-800">{parts[1] || parts[0]}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Configuration</span>
                <span className="font-medium text-slate-800">{asset.configuration || "—"}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Serial</span>
              <span className="font-mono text-slate-800 uppercase">{asset.serial_number}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Billing & Lifecycle
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Vendor</span>
              <span className="font-medium text-slate-800">{asset.vendor}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Invoice</span>
              <span className="font-medium text-slate-800">{asset.invoice_number}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Cost</span>
              <span className="font-semibold text-slate-900">
                ₹{asset.cost?.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Purchased</span>
              <span className="font-medium text-slate-800">{formatDate(asset.purchase_date)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Warranty till</span>
              <span className="font-medium text-slate-800">{formatDate(asset.warranty_expiry)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Age</span>
              <span className="font-medium text-slate-800">{formatAssetAge(asset.purchase_date)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Condition</span>
              <span className="font-medium text-slate-800">{asset.condition}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400">Location</span>
              <span className="font-medium text-slate-800">{asset.location || "Bengaluru HQ"}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Invoice file</span>

              {asset.invoice_file_url ? (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-50/50">
                  <FileText className="h-4 w-4 text-rose-500" />
                  <span className="text-xs text-slate-700 font-medium truncate max-w-[180px]">
                    {asset.invoice_file_url.split("/").pop()}
                  </span>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${asset.invoice_file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-700 font-semibold hover:underline ml-2 cursor-pointer"
                  >
                    View
                  </a>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No invoice attached</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment & Status History */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Assignment & status history
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {asset.history?.length > 0 ? (
            asset.history.map((item) => (
              <div key={item.id} className="relative">
                <span className="absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full border-2 border-teal-600 bg-white" />
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-800">{item.action}</span>
                    {item.employee_name && (
                      <>
                        <span className="text-slate-400">to</span>
                        <span className="font-semibold text-slate-800">{item.employee_name}</span>
                        {item.employee_code && (
                          <span className="text-[10px] text-slate-400">
                            {item.employee_code}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(item.date)}</p>
                  {item.notes && (
                    <p className="text-xs text-slate-500 mt-1 bg-slate-50/70 p-2 rounded border border-slate-100">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No activity recorded for this asset.</p>
          )}
        </div>
      </div>

      {/* MODAL 1: Change Status Modal */}
      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Change status</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {asset.make_model} · {asset.tag}
              </p>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New status
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* DYNAMIC FIELD: Destination only appears when "Shipped to" is selected */}
              {selectedStatus === "Shipped to" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Destination / Shipping Location *
                  </label>
                  <input
                    required
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Pune Tech Center / Remote - Delhi"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
                  />
                  <span className="block text-[11px] text-slate-400 mt-1">
                    This destination will update the asset's current location and timeline.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Note
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="What changed and why (e.g. tracking number, courier info)"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setDestination("");
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e746b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b5f58] transition disabled:opacity-50"
                >
                  {updatingStatus && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reassign / Assign Modal (Matches Screenshot Exactly) */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Reassign asset</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {asset.make_model} · {asset.tag}
              </p>
            </div>

            {/* Currently Held Banner */}
            {asset.current_holder ? (
              <div className="flex items-center gap-3 rounded-xl bg-[#eaf6f4] p-3.5 text-xs text-[#0e746b]">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-[10px] font-bold text-[#0e746b] shadow-xs shrink-0">
                  {getInitials(asset.current_holder.name)}
                </span>
                <p className="leading-snug">
                  Currently held by <strong className="font-semibold text-slate-900">{asset.current_holder.name}</strong>. Reassigning will return it and hand it to the new person.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600">
                <span>This asset is currently unassigned in stock.</span>
              </div>
            )}

            <form onSubmit={handleReassignSubmit} className="space-y-3.5">
              {/* Assign To Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to
                </label>
                <div className="relative">
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    <option value="unassigned">— Return to stock (unassigned) —</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} · {emp.department}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Condition On Return */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condition on return
                </label>
                <div className="relative">
                  <select
                    value={conditionOnReturn}
                    onChange={(e) => setConditionOnReturn(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    {CONDITION_OPTIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Effective Date */}
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

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  placeholder="Optional assignment handover notes"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e746b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b5f58] transition disabled:opacity-50"
                >
                  {reassigning && <Loader2 className="h-3 w-3 animate-spin" />}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}