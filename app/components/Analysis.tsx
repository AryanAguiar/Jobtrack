import { AnalysisProps, AnalysisType } from "@/utils/types";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";


const Analysis: FC<AnalysisProps> = ({ id }) => {
    const [data, setData] = useState<AnalysisType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);


    useEffect(() => {
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
        fetchAnalysis()
    }, [])

    return (
        <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col h-[1016px]">
            <div className="p-5 flex items-center justify-between border-b border-gray-50">
                <h1 className="text-lg font-bold text-gray-900 border-l-4 border-green-500 pl-3">Recent Analysis</h1>
                <div className="flex items-center gap-3">
                    <IoAddCircleOutline className="text-2xl text-gray-400 cursor-pointer hover:text-green-500 transition-colors" />
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
                            <Link key={analysis.id} href={`/evaluations/${analysis.id}`}>
                                <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    {analysis.resumeTitle}
                                                </h2>

                                                <div>
                                                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                                        Match: {Math.round(analysis.matchScore)}%
                                                    </span>
                                                </div>
                                            </div>


                                            <p className="text-sm text-gray-500 mt-1">
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
    );
}

export default Analysis;