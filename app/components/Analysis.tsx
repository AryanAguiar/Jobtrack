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
            <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col min-h-[300px] h-auto lg:h-[1016px]">
                <div className="p-5 flex items-center justify-between border-b border-gray-50">
                    <h1 className="text-lg font-bold text-gray-900 border-l-4 border-green-500 pl-3">Recent Analysis</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(true)}>
                            <IoAddCircleOutline className="text-2xl text-gray-400 cursor-pointer hover:text-green-500 transition-colors" />
                        </button>

                        <Link href="/evaluations" className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
                    </div>
                </div>
                <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No analysis available</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {data.slice(0, 4).map((analysis) => (
                                <Link key={analysis.id} href={`/evaluations/${analysis.id}`} className="block">
                                    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition group relative">
                                        <div className="flex justify-between items-start mb-4 gap-4 min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-2 min-w-0">
                                                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate flex-1 min-w-0">
                                                        {analysis.resumeTitle}
                                                    </h2>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <Timer expiryDate={analysis.resumeExpiry} />
                                                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                                                            Match: {Math.round(analysis.matchScore)}%
                                                        </span>
                                                    </div>
                                                </div>


                                                <p className="text-sm text-gray-500 mt-1 truncate w-full">
                                                    Evaluated for:{" "}
                                                    <span className="font-medium text-gray-700">
                                                        {analysis.jobTitle}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 line-clamp-2 italic mb-4">
                                            &quot;{analysis.summary}&quot;
                                        </div>

                                        <div className="text-sm text-gray-600 border-t pt-4">
                                            <span className="font-semibold text-gray-700">Uploaded on:</span>{" "}
                                            {new Date(analysis.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {open && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden relative flex flex-col text-gray-900">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">New Analysis</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Evaluate a resume against a job post</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
