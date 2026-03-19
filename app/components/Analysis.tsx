import { AnalysisProps, AnalysisType } from "@/utils/types";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import AnalyzeResumeForJob from "./AnalyzeResumeForJob";
import Timer from "./Timer";


const Analysis: FC<AnalysisProps> = ({ id }) => {
    const [data, setData] = useState<AnalysisType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [open, setOpen] = useState(false);
    const fetchAnalysis = async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/evaluations", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            if (!res.ok) {
                throw new Error("Failed to fetch analysis")
            }
            const result = await res.json();
            setData(result.data ?? []);
            setTotalPages(result.meta.totalPages ?? 1);
            setLoading(false)
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to fetch analysis")
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    useEffect(() => {

        fetchAnalysis()
    }, [])

    return (
        <>
            <div className="lg:rounded-3xl overflow-hidden lg:bg-glass flex flex-col h-full lg:shadow-2xl">
                <div className="p-4 lg:p-6 flex items-center justify-between lg:border-b border-[#2a2a3a]/50 mb-2 lg:mb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-orange-gradient rounded-full" />
                        <h1 className="text-xl font-bold text-white tracking-tight">Recent Analysis</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setOpen(true)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group cursor-pointer"
                        >
                            <IoAddCircleOutline className="text-2xl text-gray-400 group-hover:text-orange-400 transition-colors" />
                        </button>

                        <Link href="/evaluations" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20">
                            View All
                        </Link>
                    </div>
                </div>
                <div className="px-4 lg:p-6 pb-6 lg:overflow-y-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                            <p className="text-sm text-gray-500 font-medium">Fetching analysis...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/5 text-red-400 p-6 rounded-2xl text-sm border border-red-500/10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <p className="font-bold">Error loading analysis</p>
                                    <p className="opacity-80">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <IoAddCircleOutline className="text-4xl text-gray-500" />
                            </div>
                            <p className="text-gray-400 font-medium">No analysis available yet</p>
                            <button onClick={() => setOpen(true)} className="mt-4 text-orange-400 text-sm font-bold hover:underline cursor-pointer">Start your first analysis</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {data.slice(0, 4).map((analysis) => (
                                <Link key={analysis.id} href={`/evaluations/${analysis.id}`} className="block">
                                    <div className="bg-[#22222e]/40 border border-[#2a2a3a]/30 rounded-2xl p-6 hover:bg-[#2a2a3a]/40 hover:border-orange-500/30 transition-all duration-300 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-orange-500/0 group-hover:from-orange-500/[0.02] group-hover:to-orange-500/[0.02] transition-colors pointer-events-none" />
                                        <div className="flex flex-col mb-4 relative z-10">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <h2 className="text-xl font-bold text-gray-100 group-hover:text-orange-400 transition-colors truncate leading-tight flex-1 min-w-0">
                                                    {analysis.resumeTitle}
                                                </h2>
                                                <div className="shrink-0 hidden sm:flex flex-col items-end">
                                                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-0.5">Score</span>
                                                    <span className="text-lg font-black text-orange-500 line-height-1">
                                                        {Math.round(analysis.matchScore)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mb-3">
                                                <Timer expiryDate={analysis.resumeExpiry} />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-400 font-medium flex items-center gap-2 truncate">
                                                    <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0" />
                                                    <span className="shrink-0">Evaluated for:</span>
                                                    <span className="text-gray-200 font-bold tracking-tight truncate">
                                                        {analysis.jobTitle}
                                                    </span>
                                                </p>
                                                <div className="sm:hidden flex items-center gap-2">
                                                    <span className="text-sm font-black text-orange-500">{Math.round(analysis.matchScore)}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 mb-5 italic relative z-10">
                                            &ldquo;{analysis.summary}&rdquo;
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-[#2a2a3a]/50 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500/50" />
                                                <span className="font-semibold uppercase tracking-tighter text-gray-400">Analysis Complete</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Generated on</span>{" "}
                                                <span className="font-bold text-gray-400">{new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {open && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-xl p-4">
                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden relative flex flex-col text-white">
                        <div className="p-6 border-b border-[#2a2a3a] flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">New Analysis</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Evaluate a resume against a job post</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 bg-[#22222e] hover:bg-[#2a2a3a] rounded-full text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <AnalyzeResumeForJob
                                isModal={true}
                                onSuccess={() => {
                                    fetchAnalysis();
                                    setOpen(false);
                                }}
                                onClose={() => setOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Analysis;
