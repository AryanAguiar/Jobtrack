"use client";
import { useEffect, useState } from "react";
import { JobType } from "@/utils/types";
import Link from "next/link";
import { HiArrowLeft, HiMagnifyingGlass, HiChevronUpDown, HiOutlineBriefcase, HiOutlineMapPin, HiOutlineCurrencyDollar, HiOutlineClock } from "react-icons/hi2";
import Navbar from "../components/Navbar";
import JobModal from "../components/JobModal";

export default function JobsPage() {
    const [data, setData] = useState<JobType[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortKey, setSortKey] = useState<"salary" | "createdAt" | "status">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [selectedJob, setSelectedJob] = useState<string | null>(null);
    const limit = 9;

    // Debounce search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            setError(null);
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    sortKey,
                    sortOrder,
                });
                if (debouncedSearch) queryParams.append("search", debouncedSearch);

                const res = await fetch(`/api/jobs?${queryParams.toString()}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    throw new Error("Failed to fetch jobs");
                }
                const result = await res.json();
                setData(result.data ?? []);
                setTotalPages(result.meta?.totalPages ?? 1);
                setLoading(false);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch jobs");
                setLoading(false);
            }
        };

        fetchJobs();
    }, [page, debouncedSearch, sortKey, sortOrder]);

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("applied")) return "bg-blue-100 text-blue-700 border-blue-200";
        if (s.includes("interview")) return "bg-purple-100 text-purple-700 border-purple-200";
        if (s.includes("offer")) return "bg-green-100 text-green-700 border-green-200";
        if (s.includes("reject")) return "bg-red-100 text-red-700 border-red-200";
        return "bg-gray-100 text-gray-700 border-gray-200";
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Navbar userName={user?.name || "Loading..."} />

                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
                    >
                        <HiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
                </div>

                {/* Filters Row */}
                <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search in this page..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by:</span>
                            <select
                                value={sortKey}
                                onChange={(e) => setSortKey(e.target.value as any)}
                                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                            >
                                <option value="createdAt">Date</option>
                                <option value="salary">Salary</option>
                                <option value="status">Status</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                            title={sortOrder === "asc" ? "Ascending" : "Descending"}
                        >
                            <HiChevronUpDown className="text-lg" />
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading jobs...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center">
                            <p className="font-bold mb-2 text-lg">Failed to Load</p>
                            <p>{error}</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineBriefcase className="text-3xl text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
                            <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                                {searchQuery ? `No results matching "${searchQuery}"` : "You haven't added any jobs yet."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.map((job: JobType) => (
                                    <div onClick={() => setSelectedJob(job.id)} key={job.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors text-blue-600 group-hover:text-white transition-colors">
                                                <HiOutlineBriefcase className="text-2xl" />
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                {job.title}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                At: <span className="font-semibold text-gray-700">{job.company}</span>
                                            </p>

                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <HiOutlineMapPin className="text-base text-gray-400" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <HiOutlineCurrencyDollar className="text-base text-gray-400" />
                                                    {job.salary || "Not specified"}
                                                </div>
                                            </div>

                                            <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-xs text-gray-500 italic line-clamp-3 leading-relaxed">
                                                {job.description || "No description provided."}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <HiOutlineClock className="text-base" />
                                                {new Date(job.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <span className="text-blue-600 group-hover:underline cursor-pointer">View Details →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i + 1
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                            {selectedJob && <JobModal id={selectedJob} onClose={() => setSelectedJob(null)} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}