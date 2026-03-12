"use client";

import { useEffect, useState, use } from "react";
import { AnalysisType } from "@/utils/types";
import { HiArrowLeft } from "react-icons/hi2";
import { showCustomToast } from "@/app/components/CustomToast";
import { useRouter } from "next/navigation";
import Timer from "@/app/components/Timer";

export default function AnalysisDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await fetch(`/api/evaluations/${id}`);
                if (!res.ok) throw new Error("Failed to fetch evaluation");
                const result = await res.json();
                setAnalysis(result);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch evaluation");
                setLoading(false);
            }
        };

        if (id) {
            setLoading(true);
            fetchAnalysis();
        }
    }, [id]);

    const deleteAnalysis = async () => {
        showCustomToast.confirm(
            "Delete Evaluation?",
            "Are you sure you want to delete this evaluation?",
            async () => {
                try {
                    setLoading(true);
                    const res = await fetch(`/api/evaluations/${id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!res.ok) throw new Error("Failed to delete evaluation");
                    showCustomToast.success("Deleted", "Evaluation deleted successfully");
                    router.back();
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to delete evaluation");
                    showCustomToast.error("Error", "Failed to delete evaluation");
                } finally {
                    setLoading(false);
                }
            },
            "Delete"
        );
    };

    if (!id) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors group cursor-pointer"
            >
                <HiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                Go Back
            </button>

            <div className="bg-[#1a1a24] rounded-3xl border border-[#2a2a3a] overflow-hidden mt-4">
                {loading ? (
                    <div className="p-10 sm:p-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading evaluation...</p>
                    </div>
                ) : error ? (
                    <div className="p-10 sm:p-20 text-center">
                        <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl inline-block max-w-md border border-red-500/20">
                            <h3 className="font-bold text-lg mb-2">Error</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                ) : analysis ? (
                    <div className="divide-y divide-[#2a2a3a]">
                        <div className="p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-[#1a1a24] to-[#22222e]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-white leading-tight break-words block">
                                        {analysis.resumeTitle} <span className="text-[#3a3a4a] mx-2">/</span> {analysis.jobTitle}
                                    </h1>
                                    <div className="flex items-center gap-4 mt-4">
                                        <span className="px-3 py-1 bg-[#22222e] border border-[#3a3a4a] rounded-full text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Evaluation Report
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <div className="hidden sm:block flex items-center gap-2 border-l border-[#3a3a4a] pl-4 ml-4">
                                            <Timer expiryDate={analysis.resumeExpiry} />
                                        </div>
                                    </div>
                                    <div className="sm:hidden flex items-center gap-2 pt-4">
                                        <Timer expiryDate={analysis.resumeExpiry} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Match Score</p>
                                        <p className="text-3xl sm:text-5xl font-black text-orange-400 tabular-nums">
                                            {Math.round(analysis.matchScore)}<span className="text-2xl ml-0.5">%</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={deleteAnalysis}
                                        className="px-5 py-2.5 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors ml-4 text-sm border border-red-500/20"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-red-400 mt-5">
                                AI-generated evaluation. Results may contain inaccuracies.
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 lg:p-12 space-y-12">
                            <section>
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-orange-500 rounded-full"></span>
                                    Professional Summary
                                </h3>
                                <div className="text-gray-400 leading-relaxed whitespace-pre-line text-lg bg-orange-500/5 border border-orange-500/10 p-8 rounded-3xl">
                                    {analysis.summary}
                                </div>
                            </section>

                            {analysis.breakdown && (
                                <section>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-green-500 rounded-full"></span>
                                        Score Breakdown
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Skills Match', value: analysis.breakdown.skills, color: 'text-blue-400', barColor: 'bg-blue-500' },
                                            { label: 'Education', value: analysis.breakdown.education, color: 'text-purple-400', barColor: 'bg-purple-500' },
                                            { label: 'Experience', value: analysis.breakdown.experience, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
                                            { label: 'Role Match', value: analysis.breakdown.role ?? 0, color: 'text-amber-400', barColor: 'bg-amber-500' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="bg-[#22222e] border border-[#2a2a3a] p-8 rounded-3xl hover:border-[#3a3a4a] transition-all">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{item.label}</p>
                                                <div className="flex items-end gap-2">
                                                    <p className={`text-4xl font-bold ${item.color}`}>{Math.round(item.value)}%</p>
                                                </div>
                                                <div className="mt-4 w-full bg-[#1a1a24] rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.barColor}`}
                                                        style={{ width: `${item.value}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-emerald-400 rounded-full"></span>
                                        Key Strengths
                                    </h3>
                                    <ul className="space-y-4">
                                        {analysis.strengths.map((s, i) => (
                                            <li key={i} className="flex gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-gray-300">
                                                <span className="text-emerald-400 font-bold">✓</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <span className="w-1.5 h-8 bg-red-400 rounded-full"></span>
                                        Identified Gaps
                                    </h3>
                                    <ul className="space-y-4">
                                        {analysis.gaps.map((g, i) => (
                                            <li key={i} className="flex gap-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-gray-300">
                                                <span className="text-red-400 font-bold">!</span>
                                                {g}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
