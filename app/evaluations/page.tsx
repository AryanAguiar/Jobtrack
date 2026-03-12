"use client";

import { useEffect, useState } from "react";
import { AnalysisType } from "@/utils/types";
import Link from "next/link";
import { HiArrowLeft, HiMagnifyingGlass, HiChevronUpDown, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineTrophy, HiOutlineTrash, HiPlus } from "react-icons/hi2";
import { Autocomplete, TextField } from "@mui/material";
import AnalyzeResumeForJob from "../components/AnalyzeResumeForJob";
import { showCustomToast } from "../components/CustomToast";
import Timer from "../components/Timer";
import { useRouter } from "next/navigation";

const sortOptions = [
    { label: "Date", value: "createdAt" },
    { label: "Match Score", value: "matchScore" }
];

export default function Evaluations() {
    const router = useRouter();
    const [data, setData] = useState<AnalysisType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortKey, setSortKey] = useState<"matchScore" | "createdAt">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

    const limit = 9;

    useEffect(() => {
        if (isAnalysisModalOpen) { document.body.style.overflow = "hidden"; } else { document.body.style.overflow = "unset"; }
        return () => { document.body.style.overflow = "unset"; };
    }, [isAnalysisModalOpen]);

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchAnalysis = async () => {
        setError(null); setLoading(true);
        try {
            const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString(), sortKey, sortOrder });
            if (debouncedSearch) queryParams.append("search", debouncedSearch);
            const res = await fetch(`/api/evaluations?${queryParams.toString()}`, { method: "GET", headers: { "Content-Type": "application/json" } });
            if (!res.ok) throw new Error("Failed to fetch analysis");
            const result = await res.json();
            setData(result.data ?? []); setTotalPages(result.meta?.totalPages ?? 1); setLoading(false);
        } catch (error) { setError(error instanceof Error ? error.message : "Failed to fetch analysis"); setLoading(false); }
    };

    useEffect(() => { fetchAnalysis(); }, [page, debouncedSearch, sortKey, sortOrder]);

    const deleteAnalysis = async (id: string) => {
        showCustomToast.confirm(
            "Delete Evaluation?",
            "Are you sure you want to delete this evaluation?",
            async () => {
                try {
                    setLoading(true);
                    const res = await fetch(`/api/evaluations/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
                    if (!res.ok) throw new Error("Failed to delete evaluation");
                    setData((prev) => prev.filter((item) => item.id !== id));
                    showCustomToast.success("Deleted", "Evaluation deleted successfully");
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to delete evaluation");
                    showCustomToast.error("Error", "Failed to delete evaluation");
                }
                finally { setLoading(false); }
            },
            "Delete"
        );
    };

    return (
        <div className="max-w-7xl w-full mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group cursor-pointer">
                    <HiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" /> Go Back
                </button>
                <h1 className="text-2xl font-bold text-white">All Evaluations</h1>
            </div>

            <div className="mt-8 bg-[#1a1a24] p-4 rounded-2xl border border-[#2a2a3a] flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:max-w-md">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    <input type="text" placeholder="Search in this page..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-[#22222e] border border-[#3a3a4a] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-white placeholder:text-gray-600" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-[#22222e] border border-[#3a3a4a] rounded-xl px-4 py-2 min-w-[200px]">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sort by:</span>
                            <Autocomplete options={sortOptions} getOptionLabel={(option) => option.label}
                                value={sortOptions.find(o => o.value === sortKey) || sortOptions[0]}
                                onChange={(_, newValue) => setSortKey(newValue ? newValue.value as any : "createdAt")} disableClearable
                                componentsProps={{ paper: { sx: { backgroundColor: '#22222e', border: '1px solid #3a3a4a', color: '#f1f1f4', '& .MuiAutocomplete-option': { color: '#f1f1f4', '&:hover': { backgroundColor: '#2a2a3a' }, '&[aria-selected="true"]': { backgroundColor: '#3a3a4a' } } } } }}
                                renderInput={(params) => (
                                    <TextField {...params} size="small" variant="standard"
                                        InputProps={{ ...params.InputProps, disableUnderline: true, sx: { fontSize: '0.875rem', fontWeight: 500, color: '#f1f1f4' } }}
                                        sx={{ width: '120px' }} />
                                )} />
                        </div>
                        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="p-2.5 bg-[#22222e] border border-[#3a3a4a] rounded-xl hover:bg-[#2a2a3a] transition-colors text-gray-400">
                            <HiChevronUpDown className="text-lg" />
                        </button>
                    </div>
                    <button onClick={() => setIsAnalysisModalOpen(true)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm cursor-pointer whitespace-nowrap">
                        <HiPlus className="text-lg" /> New Analysis
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-10 sm:p-20 bg-[#1a1a24] rounded-3xl border border-[#2a2a3a]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading evaluations...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 text-red-400 p-8 rounded-3xl text-center border border-red-500/20">
                        <p className="font-bold mb-2 text-lg">Failed to Load</p><p>{error}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="bg-[#1a1a24] rounded-3xl border border-dashed border-[#3a3a4a] p-10 sm:p-20 text-center">
                        <div className="w-16 h-16 bg-[#22222e] rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlineDocumentText className="text-3xl text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white">No evaluations found</h3>
                        <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                            {searchQuery ? `No results matching "${searchQuery}"` : "You haven't performed any evaluations yet."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.map((analysis: AnalysisType) => (
                                <Link key={analysis.id} href={`/evaluations/${analysis.id}`}>
                                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl p-6 hover:border-[#3a3a4a] hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500 transition-colors text-orange-400 group-hover:text-white">
                                                <HiOutlineTrophy className="text-2xl" />
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Match Score</p>
                                                    <p className="text-2xl font-black text-orange-400 tabular-nums">{Math.round(analysis.matchScore)}%</p>
                                                </div>
                                                <button className="p-2 text-gray-600 hover:text-red-400 transition-colors cursor-pointer" title="Delete Evaluation"
                                                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); deleteAnalysis(analysis.id); }}>
                                                    <HiOutlineTrash className="text-xl" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">{analysis.resumeTitle}</h2>
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                For: <span className="font-semibold text-gray-300">{analysis.jobTitle}</span>
                                            </p>
                                            <div className="mt-4 p-4 bg-[#22222e] rounded-2xl border border-[#2a2a3a] text-xs text-gray-500 italic line-clamp-3 leading-relaxed">
                                                &quot;{analysis.summary}&quot;
                                            </div>
                                        </div>
                                        <br />
                                        <div className="mt-4 flex items-center justify-between">
                                            <Timer expiryDate={analysis.resumeExpiry} />
                                        </div>

                                        <div className="mt-6 pt-5 border-t border-[#2a2a3a] flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <HiOutlineCalendar className="text-base" />
                                                    {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <span className="text-orange-400 group-hover:underline">View Report →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2 pb-8">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-4 py-2 border border-[#3a3a4a] rounded-xl text-sm font-bold text-gray-400 bg-[#1a1a24] hover:bg-[#22222e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i} onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i + 1 ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-[#1a1a24] text-gray-400 border border-[#3a3a4a] hover:border-[#4a4a5a]"}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="px-4 py-2 border border-[#3a3a4a] rounded-xl text-sm font-bold text-gray-400 bg-[#1a1a24] hover:bg-[#22222e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isAnalysisModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-xl p-4">
                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden relative flex flex-col text-white text-left">
                        <div className="p-6 border-b border-[#2a2a3a] flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">New Analysis</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Evaluate a resume against a job post</p>
                            </div>
                            <button onClick={() => setIsAnalysisModalOpen(false)}
                                className="p-2 bg-[#22222e] hover:bg-[#2a2a3a] rounded-full text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <AnalyzeResumeForJob isModal={true} onSuccess={() => { fetchAnalysis(); setIsAnalysisModalOpen(false); }} onClose={() => setIsAnalysisModalOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
