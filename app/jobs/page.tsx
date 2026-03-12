"use client";
import { useEffect, useState } from "react";
import { JobType } from "@/utils/types";
import Link from "next/link";
import { HiArrowLeft, HiMagnifyingGlass, HiChevronUpDown, HiOutlineBriefcase, HiOutlineMapPin, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineTrash, HiPlus } from "react-icons/hi2";
import { Autocomplete, TextField } from "@mui/material";
import JobForm from "../components/JobForm";
import { showCustomToast } from "../components/CustomToast";
import { useRouter } from "next/navigation";

const sortOptions = [
    { label: "Date", value: "createdAt" },
    { label: "Salary", value: "salary" },
    { label: "Status", value: "status" }
];

export default function JobsPage() {
    const router = useRouter();
    const [data, setData] = useState<JobType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortKey, setSortKey] = useState<"salary" | "createdAt" | "status">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const limit = 9;

    useEffect(() => {
        if (isAddModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isAddModalOpen]);

    // Debounce search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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

    useEffect(() => {
        fetchJobs();
    }, [page, debouncedSearch, sortKey, sortOrder]);

    const deleteJob = async (id: string) => {
        showCustomToast.confirm(
            "Delete Job Opportunity?",
            "Are you sure you want to delete this job posting? This action cannot be undone.",
            async () => {
                try {
                    setLoading(true);
                    const res = await fetch(`/api/jobs/${id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!res.ok) throw new Error("Failed to delete job");
                    setData((prev) => prev.filter((item) => item.id !== id));
                    showCustomToast.success("Success!", "Job deleted successfully");
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to delete job");
                    showCustomToast.error("Deletion Failed", "Failed to delete job");
                } finally {
                    setLoading(false);
                }
            },
            "Confirm Delete"
        );
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("applied")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        if (s.includes("interview")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        if (s.includes("offer")) return "bg-green-500/10 text-green-400 border-green-500/20";
        if (s.includes("reject")) return "bg-red-500/10 text-red-400 border-red-500/20";
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    };

    return (
        <div className="max-w-7xl w-full mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group cursor-pointer"
                >
                    <HiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                    Go Back
                </button>

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">All Jobs</h1>
                </div>
            </div>

            {/* Filters Row */}
            <div className="mt-8 bg-[#1a1a24] p-4 rounded-2xl border border-[#2a2a3a] flex flex-col lg:flex-row gap-4 items-center justify-between transition-all">
                <div className="relative w-full lg:max-w-md">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    <input
                        type="text"
                        placeholder="Search in this page..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-[#22222e] border border-[#3a3a4a] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-white placeholder:text-gray-600"
                    />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-[#22222e] border border-[#3a3a4a] rounded-xl px-4 py-2 min-w-[200px]">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sort by:</span>
                            <Autocomplete
                                options={sortOptions}
                                getOptionLabel={(option) => option.label}
                                value={sortOptions.find(o => o.value === sortKey) || sortOptions[0]}
                                onChange={(_, newValue) => {
                                    setSortKey(newValue ? newValue.value as any : "createdAt");
                                }}
                                disableClearable
                                componentsProps={{
                                    paper: {
                                        sx: {
                                            backgroundColor: '#22222e',
                                            border: '1px solid #3a3a4a',
                                            color: '#f1f1f4',
                                            '& .MuiAutocomplete-option': {
                                                color: '#f1f1f4',
                                                '&:hover': { backgroundColor: '#2a2a3a' },
                                                '&[aria-selected="true"]': { backgroundColor: '#3a3a4a' },
                                            },
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        variant="standard"
                                        InputProps={{
                                            ...params.InputProps,
                                            disableUnderline: true,
                                            sx: { fontSize: '0.875rem', fontWeight: 500, color: '#f1f1f4' }
                                        }}
                                        sx={{ width: '100px' }}
                                    />
                                )}
                            />
                        </div>

                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="p-2.5 bg-[#22222e] border border-[#3a3a4a] rounded-xl hover:bg-[#2a2a3a] transition-colors text-gray-400"
                            title={sortOrder === "asc" ? "Ascending" : "Descending"}
                        >
                            <HiChevronUpDown className="text-lg" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm cursor-pointer whitespace-nowrap"
                    >
                        <HiPlus className="text-lg" />
                        Add Job
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-10 sm:p-20 bg-[#1a1a24] rounded-3xl border border-[#2a2a3a]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading jobs...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 text-red-400 p-8 rounded-3xl text-center border border-red-500/20">
                        <p className="font-bold mb-2 text-lg">Failed to Load</p>
                        <p>{error}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="bg-[#1a1a24] rounded-3xl border border-dashed border-[#3a3a4a] p-10 sm:p-20 text-center">
                        <div className="w-16 h-16 bg-[#22222e] rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlineBriefcase className="text-3xl text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white">No jobs found</h3>
                        <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                            {searchQuery ? `No results matching "${searchQuery}"` : "You haven't added any jobs yet."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.map((job: JobType) => (
                                <Link key={job.id} href={`/jobs/${job.id}`}>
                                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl p-6 hover:border-[#3a3a4a] hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer relative">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500 transition-colors text-orange-400 group-hover:text-white">
                                                <HiOutlineBriefcase className="text-2xl" />
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                                                        {job.status}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                                        {job.type?.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <button
                                                    className="p-2 text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
                                                    title="Delete Job"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        deleteJob(job.id);
                                                    }}
                                                >
                                                    <HiOutlineTrash className="text-xl" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                                                {job.title}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 min-w-0">
                                                <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0"></span>
                                                <span className="shrink-0">At:</span>
                                                <span className="font-semibold text-gray-300 truncate">{job.company}</span>
                                            </p>

                                            <div className="mt-4 space-y-2 min-w-0">
                                                <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                                                    <HiOutlineMapPin className="text-base text-gray-600 shrink-0" />
                                                    <span className="truncate">{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                                                    <HiOutlineCurrencyDollar className="text-base text-gray-600 shrink-0" />
                                                    <span className="truncate">{job.salary || "Not specified"}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 p-4 bg-[#22222e] rounded-2xl border border-[#2a2a3a] text-xs text-gray-500 italic line-clamp-3 leading-relaxed">
                                                {job.description || "No description provided."}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-5 border-t border-[#2a2a3a] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <HiOutlineClock className="text-base" />
                                                {new Date(job.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <span className="text-orange-400 group-hover:underline cursor-pointer">View Details →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2 pb-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-[#3a3a4a] rounded-xl text-sm font-bold text-gray-400 bg-[#1a1a24] hover:bg-[#22222e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i + 1
                                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                                : "bg-[#1a1a24] text-gray-400 border border-[#3a3a4a] hover:border-[#4a4a5a]"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-[#3a3a4a] rounded-xl text-sm font-bold text-gray-400 bg-[#1a1a24] hover:bg-[#22222e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Job Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-xl p-4">
                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col text-white text-left">
                        <div className="p-6 border-b border-[#2a2a3a] flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Add New Job</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Fill in the details for the new job post</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 bg-[#22222e] hover:bg-[#2a2a3a] rounded-full text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <JobForm
                                isModal={true}
                                onSuccess={() => {
                                    fetchJobs();
                                    setIsAddModalOpen(false);
                                }}
                                onClose={() => setIsAddModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}