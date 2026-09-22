"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import GlobalSearch from "@/components/GlobalSearch";

interface EmployeeItem {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
  assigned_assets_count: number;
}

const DEPARTMENTS = [
  "All departments",
  "Engineering",
  "Design",
  "Backend",
  "Frontend",
  "QA",
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function EmployeesPage() {
  const router = useRouter();
  const PAGE_SIZE = 4;
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All departments");
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        page_size: PAGE_SIZE,
      };
      if (search.trim()) params.q = search.trim();
      if (selectedDept !== "All departments") params.department = selectedDept;

      const res = await api.get<EmployeeItem[]>("/api/employees", { params });
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedDept]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Employees
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Directory and asset holdings
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

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input Filter with Chevron */}
        <div className="relative flex-1 min-w-[320px]">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search employees..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-300"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Department Dropdown */}
        <div className="relative">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-normal text-slate-700 outline-none hover:bg-slate-50 cursor-pointer"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Main Employees Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <th className="py-3 px-5 font-normal">NAME</th>
              <th className="py-3 px-5 font-normal">EMP ID</th>
              <th className="py-3 px-5 font-normal">DEPARTMENT</th>
              <th className="py-3 px-5 font-normal">EMAIL</th>
              <th className="py-3 px-5 font-normal">ASSETS HELD</th>
              <th className="py-3 px-5 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <Loader2 className="inline-block h-4 w-4 animate-spin mr-2 text-teal-700" />
                  Loading directory...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 font-normal">
                  No employees found matching criteria.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => router.push(`/employees/${emp.id}`)}
                  className="hover:bg-slate-50/60 transition cursor-pointer"
                >
                  {/* Name with Avatar Tag */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#e6f4f2] text-[10px] font-bold text-[#0d9488]">
                        {getInitials(emp.name)}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">
                        {emp.name}
                      </span>
                    </div>
                  </td>

                  {/* EMP ID */}
                  <td className="py-4 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {emp.employee_id}
                  </td>

                  {/* Department */}
                  <td className="py-4 px-5 text-slate-700 text-xs">
                    {emp.department}
                  </td>

                  {/* Email */}
                  <td className="py-4 px-5 text-slate-500 text-xs font-mono">
                    {emp.email}
                  </td>

                  {/* Assets Held */}
                  <td className="py-4 px-5 text-slate-700 text-xs font-medium">
                    {emp.assigned_assets_count}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        emp.is_active
                          ? "bg-[#e6f7f2] text-[#0d9488]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          emp.is_active ? "bg-[#0d9488]" : "bg-slate-400"
                        }`}
                      />
                      {emp.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Page <span className="font-semibold text-slate-700">{page}</span>
            {employees.length > 0 && ` · Showing ${employees.length} employees`}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>

            <button
              type="button"
              /* If fewer than PAGE_SIZE items were returned, we reached the last page */
              disabled={employees.length < PAGE_SIZE || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          </div>
      </div>
    </div>
  );
}