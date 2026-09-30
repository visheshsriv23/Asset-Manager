"use client";

import { useEffect, useState, useCallback, use, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Loader2,
  FileText,
  ChevronDown,
  ArrowLeft,
  Upload,
  ExternalLink,
  Layers,
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
  let months =
    (now.getFullYear() - purchase.getFullYear()) * 12 +
    (now.getMonth() - purchase.getMonth());
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
  if (parts.length >= 2)
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assetId = resolvedParams.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [destination, setDestination] = useState("");
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>("");
  const [employeesList, setEmployeesList] = useState<EmployeeOption[]>([]);

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
      setEmployeesList(empRes.data);
      setSelectedStatus(assetRes.data.status);
      setSelectedEmployeeId(
        assetRes.data.current_holder
          ? String(assetRes.data.current_holder.id)
          : "unassigned"
      );
      setAssignedEmployeeId(
        assetRes.data.current_holder
          ? String(assetRes.data.current_holder.id)
          : ""
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

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.post(`/api/assets/${assetId}/status`, {
        status: selectedStatus,
        destination:
          selectedStatus === "Shipped to" ? destination.trim() : undefined,
        employee_id:
          selectedStatus === "Assigned" && assignedEmployeeId
            ? Number(assignedEmployeeId)
            : undefined,
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

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReassigning(true);
    try {
      await api.post(`/api/assets/${assetId}/reassign`, {
        employee_id:
          selectedEmployeeId === "unassigned"
            ? null
            : Number(selectedEmployeeId),
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      await api.post(`/api/assets/${assetId}/invoice`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchDetail();
    } catch (err) {
      console.error("Invoice upload failed:", err);
      alert("Failed to upload invoice.");
    } finally {
      setIsUploading(false);
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
        <Link
          href="/assets"
          className="text-xs text-teal-700 underline mt-2 inline-block"
        >
          Return to assets
        </Link>
      </div>
    );
  }

  // Parse configuration specs
  const configList: { label: string; value: string }[] = [];
  if (asset.configuration) {
    const items = asset.configuration.split("/").map((s) => s.trim());
    const labels = ["Processor", "Memory", "Storage", "Details"];
    items.forEach((item, idx) => {
      if (item.includes(":")) {
        const [k, v] = item.split(":");
        configList.push({ label: k.trim(), value: v?.trim() || "—" });
      } else {
        configList.push({
          label: labels[idx] || `Spec ${idx + 1}`,
          value: item || "—",
        });
      }
    });
  }

  return (
    <div className="-m-8 min-h-screen bg-[#f4f6f8]">
      {/* 1. STICKY TOP HEADER IN WHITE BOX WITH BOTTOM BORDER */}
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white px-8 py-4 shadow-xs">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Asset detail
            </h1>
            <p className="text-[11px] font-normal text-slate-400 mt-0.5">
              Full record and history
            </p>
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch />
            <Link
              href="/assets/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#008b7a] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#007a6e]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add asset
            </Link>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT (Back link + Direct Hero + White Bordered Cards) */}
      <div className="mx-auto max-w-[1400px] p-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/assets"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to assets</span>
          </Link>
        </div>

        {/* HERO ROW: PLACED DIRECTLY ON THE PAGE (NO CARD CONTAINER/BOX) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-[#e6f4f2] border border-[#c2e7e2] flex items-center justify-center text-[#008b7a] shrink-0">
              <Layers className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {asset.make_model || asset.tag}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                <span className="font-mono text-slate-400 text-xs">
                  {asset.tag}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{asset.type}</span>
                <span className="text-slate-300">•</span>

                {/* Status Pill Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200/80 bg-blue-50 text-[11px] font-medium text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {asset.status}
                </span>

                {/* Assigned Holder Pill */}
                {asset.current_holder && (
                  <>
                    <span className="text-slate-300">•</span>
                    <div className="inline-flex items-center gap-1.5 text-slate-700">
                      <span className="h-4 w-4 rounded bg-slate-100 border border-slate-200 text-[9px] font-bold flex items-center justify-center text-slate-600">
                        {getInitials(asset.current_holder.name)}
                      </span>
                      <span className="font-medium text-xs text-slate-700">
                        {asset.current_holder.name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedStatus(asset.status);
                setIsStatusModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
            >
              Change status
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedEmployeeId(
                  asset.current_holder
                    ? String(asset.current_holder.id)
                    : "unassigned"
                );
                setConditionOnReturn(asset.condition || "Good");
                setIsReassignModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#008b7a] text-xs font-semibold text-white hover:bg-[#007a6e] shadow-xs transition cursor-pointer"
            >
              {asset.current_holder ? "Reassign" : "Assign"}
            </button>
          </div>
        </div>

        {/* 3. TWO-COLUMN GRID: WHITE CARDS WITH BORDER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CONFIGURATION CARD */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                CONFIGURATION
              </h3>
              <div className="space-y-4 text-xs">
                {configList.length > 0 ? (
                  configList.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">
                        {item.label}
                      </span>
                      <span className="col-span-2 text-slate-800 font-medium">
                        {item.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Processor</span>
                      <span className="col-span-2 text-slate-800 font-medium">—</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Memory</span>
                      <span className="col-span-2 text-slate-800 font-medium">—</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Storage</span>
                      <span className="col-span-2 text-slate-800 font-medium">—</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 font-medium">Details</span>
                      <span className="col-span-2 text-slate-800 font-medium">
                        4K UHD, USB-C 90W
                      </span>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Serial</span>
                  <span className="col-span-2 font-mono uppercase text-slate-800">
                    {asset.serial_number || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BILLING & LIFECYCLE CARD */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                BILLING & LIFECYCLE
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Vendor</span>
                  <span className="col-span-2 text-slate-800 font-medium">
                    {asset.vendor || "Redington India"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Invoice</span>
                  <span className="col-span-2 font-mono text-slate-800">
                    {asset.invoice_number || "INV-2023-2210"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Cost</span>
                  <span className="col-span-2 font-semibold text-slate-800">
                    ₹{Number(asset.cost || 42000).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Purchased</span>
                  <span className="col-span-2 text-slate-800 font-medium">
                    {formatDate(asset.purchase_date)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Warranty till</span>
                  <span className="col-span-2 text-slate-800 font-medium">
                    {formatDate(asset.warranty_expiry)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Age</span>
                  <span className="col-span-2 text-slate-800 font-medium">
                    {formatAssetAge(asset.purchase_date)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Condition</span>
                  <span className="col-span-2 text-slate-800 font-medium">
                    {asset.condition || "Good"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Location</span>
                  <span className="col-span-2 text-slate-800 font-medium">
                    {asset.location || "Bengaluru HQ"}
                  </span>
                </div>

                {/* Invoice File Section */}
                <div className="grid grid-cols-3 gap-2 pt-2 items-start">
                  <span className="text-slate-400 font-medium">Invoice file</span>
                  <div className="col-span-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {asset.invoice_file_url ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                        <FileText className="h-4 w-4 text-teal-700" />
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
                          {asset.invoice_file_url.split("/").pop()}
                        </span>
                        <a
                          href={
                            asset.invoice_file_url.startsWith("http")
                              ? asset.invoice_file_url
                              : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${asset.invoice_file_url}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-teal-700 hover:text-teal-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer text-center"
                      >
                        <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                          <Upload className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-slate-700">
                            {isUploading ? "Uploading..." : "Upload or attach invoice"}
                          </p>
                          <p className="text-[10px] text-slate-400">PDF, DOC or image</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ASSIGNMENT & STATUS HISTORY CARD */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-6">
            Assignment & status history
          </h3>

          <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
            {asset.history && asset.history.length > 0 ? (
              asset.history.map((item, idx) => (
                <div key={item.id || idx} className="relative pl-6 flex flex-col gap-0.5 text-xs">
                  <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-slate-300 bg-white" />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{item.action}</span>
                    {(item.employee_code || item.employee_name) && (
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.employee_code || item.employee_name}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDate(item.date)}
                  </div>
                  {item.notes && (
                    <div className="text-slate-500 text-[11px] mt-0.5">{item.notes}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 pl-6">
                No activity history logged.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. MODALS */}
      {/* Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-800">Change Status</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Update the current operating status for {asset.tag}.
            </p>

            <form onSubmit={handleStatusSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  New Status *
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {selectedStatus === "Assigned" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Assign to Employee *
                  </label>
                  <select
                    required
                    value={assignedEmployeeId}
                    onChange={(e) => setAssignedEmployeeId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    <option value="">Select an employee</option>
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedStatus === "Shipped to" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
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
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Note
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Optional status transition comments..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="rounded-lg bg-[#008b7a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#007a6e]"
                >
                  {updatingStatus ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-800">
              Reassign / Return Asset
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Transfer custody or return {asset.tag} to inventory.
            </p>

            <form onSubmit={handleReassignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Assign To
                </label>
                <div className="relative">
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    <option value="unassigned">
                      Unassign (Return to ready inventory)
                    </option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employee_id}) — {emp.department}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Hardware Condition
                </label>
                <div className="relative">
                  <select
                    value={conditionOnReturn}
                    onChange={(e) => setConditionOnReturn(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                  >
                    {CONDITION_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Note
                </label>
                <textarea
                  rows={2}
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  placeholder="Optional handover or inspection notes..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="rounded-lg bg-[#008b7a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#007a6e]"
                >
                  {reassigning ? "Updating..." : "Confirm Reassignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}