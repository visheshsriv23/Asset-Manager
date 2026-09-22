"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

const TYPE_OPTIONS = ["Laptop", "Monitor", "Phone", "Docks & peripherals"];
const CONDITION_OPTIONS = ["New", "Good", "Fair", "Poor"];

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assetId = resolvedParams.id;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identity
  const [tag, setTag] = useState("");
  const [type, setType] = useState("Laptop");
  const [makeModel, setMakeModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  // Configuration
  const [processor, setProcessor] = useState("");
  const [memory, setMemory] = useState("");
  const [storage, setStorage] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");

  // Billing & Lifecycle
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [cost, setCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [location, setLocation] = useState("Bengaluru HQ");
  const [condition, setCondition] = useState("Good");
  const [invoiceFileUrl, setInvoiceFileUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editReason, setEditReason] = useState("");

  useEffect(() => {
    async function loadAsset() {
      try {
        const res = await api.get(`/api/assets/${assetId}`);
        const data = res.data;
        setTag(data.tag || "");
        setType(data.type || "Laptop");
        setMakeModel(data.make_model || "");
        setSerialNumber(data.serial_number || "");
        setVendor(data.vendor || "");
        setInvoiceNumber(data.invoice_number || "");
        setCost(data.cost ? String(data.cost) : "");
        setPurchaseDate(data.purchase_date ? data.purchase_date.split("T")[0] : "");
        setWarrantyExpiry(data.warranty_expiry ? data.warranty_expiry.split("T")[0] : "");
        setLocation(data.location || "Bengaluru HQ");
        setCondition(data.condition || "Good");
        setInvoiceFileUrl(data.invoice_file_url || null);

        // Attempt to parse composite config string
        if (data.configuration) {
          const parts = data.configuration.split(" / ");
          parts.forEach((p: string) => {
            if (p.startsWith("CPU: ")) setProcessor(p.replace("CPU: ", ""));
            else if (p.startsWith("RAM: ")) setMemory(p.replace("RAM: ", ""));
            else if (p.startsWith("Storage: ")) setStorage(p.replace("Storage: ", ""));
            else if (p.startsWith("OS: ")) setOperatingSystem(p.replace("OS: ", ""));
            else if (!processor) setProcessor(p);
          });
        }
      } catch (err) {
        setError("Failed to load asset details for editing.");
      } finally {
        setLoading(false);
      }
    }
    loadAsset();
  }, [assetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    let uploadedUrl = invoiceFileUrl;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await api.post("/api/assets/upload-invoice", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrl = uploadRes.data.url;
      }

      const configParts = [
        processor && `CPU: ${processor}`,
        memory && `RAM: ${memory}`,
        storage && `Storage: ${storage}`,
        operatingSystem && `OS: ${operatingSystem}`,
      ].filter(Boolean);
      const configurationString = configParts.length > 0 ? configParts.join(" / ") : "Standard Specs";
      const numericCost = parseFloat(String(cost).replace(/[^0-9.]/g, "")) || 0.0;

      const payload = {
        type,
        make_model: makeModel.trim(),
        serial_number: serialNumber.trim().toUpperCase(),
        configuration: configurationString,
        vendor: vendor.trim(),
        invoice_number: invoiceNumber.trim(),
        cost: numericCost,
        purchase_date: purchaseDate ? new Date(purchaseDate).toISOString() : new Date().toISOString(),
        warranty_expiry: warrantyExpiry ? new Date(warrantyExpiry).toISOString() : null,
        location: location.trim() || "Bengaluru HQ",
        condition,
        invoice_file_url: uploadedUrl,
        edit_reason: editReason.trim() || "Updated configuration and billing specs",
      };

      await api.put(`/api/assets/${assetId}`, payload);
      router.push(`/assets/${assetId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update asset.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-teal-700" />
        Loading asset for editing...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      <div className="flex items-center gap-3">
        <Link
          href={`/assets/${assetId}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Edit asset: {tag}
          </h1>
          <p className="text-xs text-slate-400">
            Update hardware specifications, billing data, or location
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 leading-none">Identity</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">Primary device identifiers.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Asset tag</label>
              <input
                disabled
                value={tag}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed outline-none"
              />
              <span className="block text-[11px] text-slate-400 mt-1">Asset tag identifier cannot be changed.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Make & model *</label>
              <input
                required
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Serial number *</label>
              <input
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700 uppercase"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 leading-none">Configuration</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">Hardware specifications.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Processor</label>
              <input
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                placeholder="e.g. Apple M3 Pro / Intel i5"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Memory</label>
              <input
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="e.g. 16 GB"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Storage</label>
              <input
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="e.g. 512 GB SSD"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Operating system</label>
              <input
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value)}
                placeholder="e.g. macOS Sonoma / Windows 11"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">Billing & Lifecycle</h2>
            <p className="text-xs text-slate-400 mt-1">Vendor, cost, and location.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Vendor *</label>
              <input
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Invoice number *</label>
              <input
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cost (₹) *</label>
              <input
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Purchase date *</label>
              <input
                required
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Warranty expiry</label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              >
                {CONDITION_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason for Edit / Audit note</label>
              <input
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Corrected RAM specifications"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Invoice file {invoiceFileUrl && <span className="text-slate-400 font-normal">({invoiceFileUrl.split("/").pop()})</span>}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-6 px-4 text-center hover:bg-slate-50 transition cursor-pointer"
            >
              <Upload className="h-4 w-4 text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : "Replace invoice file"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click to browse or drop an updated file</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/assets/${assetId}`}
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
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}