"use client";

import { useEffect } from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Upload, Loader2, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import GlobalSearch from "@/components/GlobalSearch";

const TYPE_OPTIONS = ["Laptop", "Monitor", "Phone", "Docks & peripherals"];
const CONDITION_OPTIONS = ["New", "Good", "Fair", "Poor"];
const STATUS_OPTIONS = [
    "Ready to assign",
    "Assigned",
    "In repair",
    "Working",
    "Hardware issue",
    "Shipped",
    "Retired",
];

export default function AddAssetPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identity
  const [tag, setTag] = useState("");
  const [type, setType] = useState("Laptop");
  const [makeModel, setMakeModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  // Configuration (composite)
  const [processor, setProcessor] = useState("");
  const [memory, setMemory] = useState("");
  const [storage, setStorage] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");

  // Billing
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [cost, setCost] = useState("");
  const [shippingDestination, setShippingDestination] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [location, setLocation] = useState("Bengaluru HQ");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Status
  const [condition, setCondition] = useState("New");
  const [status, setStatus] = useState("Ready to assign");
  const [notes, setNotes] = useState("");
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>("");
  const [employeesList, setEmployeesList] = useState<Array<{ id: number; name: string; department: string }>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await api.get("/api/employees");
        setEmployeesList(res.data);
        if (res.data.length > 0) {
          setAssignedEmployeeId(String(res.data[0].id));
        }
      } catch (err) {
        console.error("Failed to load employees for assignment:", err);
      }
    }
    loadEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
  
    try {
      let uploadedFileUrl = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await api.post("/api/assets/upload-invoice", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedFileUrl = uploadRes.data.url;
      }
      const finalLocation =
      status === "Shipped to" && shippingDestination.trim()
        ? shippingDestination.trim()
        : location.trim() || "Bengaluru HQ";
  
      const payload = {
        tag: tag.trim().toUpperCase(),
        type,
        make_model: makeModel.trim(),
        serial_number: serialNumber.trim().toUpperCase(),configuration: [processor, memory, storage, operatingSystem].filter(Boolean).join(" / ") || "Standard Specs",
        vendor: vendor.trim(),
        invoice_number: invoiceNumber.trim(),
        cost: parseFloat(String(cost).replace(/[^0-9.]/g, "")) || 0.0,
        purchase_date: purchaseDate ? new Date(purchaseDate).toISOString() : new Date().toISOString(),
        warranty_expiry: warrantyExpiry ? new Date(warrantyExpiry).toISOString() : null,
        location: finalLocation,
        condition,
        status,
        current_holder_id: status === "Assigned" && assignedEmployeeId ? Number(assignedEmployeeId) : null,
        notes: notes.trim(),
        invoice_file_url: uploadedFileUrl,
      };
  
      await api.post("/api/assets", payload);
      router.push("/assets");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create asset.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Add asset
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Register a new asset in the portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlobalSearch />

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-[#0e746b] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            Add asset
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identity */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 leading-none">Identity</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            What is this asset and how do we recognise it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Asset tag <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="AB-LT-031"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
              <span className="block text-[11px] text-slate-400 mt-1">
                Unique code printed on the label.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Make & model <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                placeholder="MacBook Air M2"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Serial number
              </label>
              <input
                required
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="C02Y..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Configuration */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 leading-none">Configuration</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Specs, so you can tell two identical-looking machines apart.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Processor
              </label>
              <input
                type="text"
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                placeholder="Apple M2 / Intel i5-1345U"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Memory
              </label>
              <input
                type="text"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="16 GB"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Storage
              </label>
              <input
                type="text"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="256 GB SSD"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Operating system
              </label>
              <input
                type="text"
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value)}
                placeholder="macOS / Windows 11"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Billing */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">Billing</h2>
            <p className="text-xs text-slate-400 mt-1">
              Purchase and warranty details for finance and lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vendor
              </label>
              <input
                required
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Redington India"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invoice number
              </label>
              <input
                required
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2026-0142"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cost
              </label>
              <input
                required
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="₹1,10,000"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Purchase date
              </label>
              <div className="relative">
                <input
                  required
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Warranty expiry
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={warrantyExpiry}
                  onChange={(e) => setWarrantyExpiry(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bengaluru HQ"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {/* Invoice File Drop Area */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Invoice file
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-7 px-4 text-center hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-400 mb-2">
                <Upload className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : "Attach invoice"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PDF, DOC or image — click to browse or drop a file
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Status */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">Status</h2>
            <p className="text-xs text-slate-400 mt-1">Where the asset stands today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
              >
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value === "Assigned" && !assignedEmployeeId && employeesList.length > 0) {
                    setAssignedEmployeeId(String(employeesList[0].id));
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
              >
                <option value="Ready to assign">Ready to assign</option>
                <option value="Assigned">Assigned</option>
                <option value="In repair">In repair</option>
                <option value="Hardware issue">Hardware issue</option>
                <option value="Shipped to">Shipped to</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Conditionally rendered employee select */}
            {status === "Assigned" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assign to employee *
                </label>
                <select
                  required
                  value={assignedEmployeeId}
                  onChange={(e) => setAssignedEmployeeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 cursor-pointer"
                >
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} · {emp.department}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {status === "Shipped to" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Destination / Shipping Location *
                </label>
                <input
                  required
                  type="text"
                  value={shippingDestination}
                  onChange={(e) => setShippingDestination(e.target.value)}
                  placeholder="e.g. Pune Tech Center / Remote - Delhi"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700"
                />
                <span className="block text-[11px] text-slate-400 mt-1 font-normal">
                  This destination will update the asset's current location and timeline.
                </span>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything worth recording about this asset..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-300 outline-none focus:border-teal-700 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/assets"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e746b] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0b5f58] transition disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save asset
          </button>
        </div>
      </form>
    </div>
  );
}