"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Laptop, User, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";

interface SearchResult {
  assets: Array<{ id: number; tag: string; title: string; type: string }>;
  employees: Array<{ id: number; employee_id: string; title: string; department: string }>;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<SearchResult>("/api/dashboard/global-search", {
          params: { q: query.trim() },
        });
        setResults(res.data);
        setIsOpen(true);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      if (results?.assets.length) {
        router.push(`/assets/${results.assets[0].id}`);
        setIsOpen(false);
      } else if (results?.employees.length) {
        router.push(`/employees/${results.employees[0].id}`);
        setIsOpen(false);
      } else {
        router.push(`/assets?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search tag, serial, employee..."
          className="w-64 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-8 text-xs placeholder:text-slate-400 outline-none focus:border-teal-700 transition"
        />
        {loading ? (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-teal-700" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results && (
        <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-slate-200/90 bg-white p-2 shadow-lg z-50 text-xs">
          {results.assets.length === 0 && results.employees.length === 0 ? (
            <p className="p-3 text-center text-slate-400">No matching assets or employees.</p>
          ) : (
            <div className="space-y-2">
              {results.assets.length > 0 && (
                <div>
                  <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assets
                  </span>
                  {results.assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        router.push(`/assets/${asset.id}`);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Laptop className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{asset.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{asset.tag}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.employees.length > 0 && (
                <div>
                  <span className="block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 pt-2">
                    Employees
                  </span>
                  {results.employees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        router.push(`/employees/${emp.id}`);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <User className="h-3.5 w-3.5 text-[#0d9488] shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{emp.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{emp.employee_id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}