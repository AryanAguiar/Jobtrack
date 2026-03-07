"use client";

import { useEffect, useState, use } from "react";
import { AnalysisType } from "@/utils/types";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AnalysisDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

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

        fetchUser();
        if (id) {
            setLoading(true);
            fetchAnalysis();
        }
    }, [id]);

    const deleteAnalysis = async () => {
        toast('Are you sure you want to delete this evaluation?', {
            action: {
                label: 'Confirm',
                onClick: async () => {
                    try {
                        setLoading(true);
                        const res = await fetch(`/api/evaluations/${id}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        });
                        if (!res.ok) throw new Error("Failed to delete evaluation");
                        toast.success("Evaluation deleted successfully");
                        router.push('/evaluations');
                    } catch (error) {
                        setError(error instanceof Error ? error.message : "Failed to delete evaluation");
                        toast.error("Failed to delete evaluation");
                    } finally {
                        setLoading(false);
                    }
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => { }
            }
        });
    };

    if (!id) return null;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Navbar userName={user?.name || "Loading..."} />

                <div className="mt-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <HiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loading ? (
                            <div className="p-10 sm:p-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading evaluation...</p>
                            </div>
                        ) : error ? (
                            <div className="p-10 sm:p-20 text-center">
                                <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block max-w-md">
                                    <h3 className="font-bold text-lg mb-2">Error</h3>
                                    <p>{error}</p>
                                </div>
                            </div>
                        ) : analysis ? (
                            <div className="divide-y divide-gray-100">
                                {/* Header Section */}
                                <div className="p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-white to-gray-50/50">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                                                {analysis.resumeTitle} <span className="text-blue-200 mx-2">/</span> {analysis.jobTitle}
                                            </h1>
                                            <div className="flex items-center gap-4 mt-4">
                                                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-500 uppercase tracking-wider shadow-sm">
                                                    Evaluation Report
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Match Score</p>
                                                <p className="text-3xl sm:text-5xl font-black text-blue-600 tabular-nums">
                                                    {Math.round(analysis.matchScore)}<span className="text-2xl ml-0.5">%</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={deleteAnalysis}
                                                className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm ml-4 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content Section */}
                                <div className="p-4 sm:p-6 lg:p-12 space-y-12">
                                    {/* Summary Section */}
                                    <section>
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                            <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                                            Professional Summary
                                        </h3>
                                        <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg bg-blue-50/30 border border-blue-100/50 p-8 rounded-3xl">
                                            {analysis.summary}
                                        </div>
                                    </section>

                                    {/* Score Breakdown Section */}
                                    {analysis.breakdown && (
                                        <section>
                                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                                <span className="w-1.5 h-8 bg-green-600 rounded-full"></span>
                                                Score Breakdown
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Skills Match', value: analysis.breakdown.skills, color: 'text-blue-600', bg: 'bg-blue-50' },
                                                    { label: 'Education', value: analysis.breakdown.education, color: 'text-purple-600', bg: 'bg-purple-50' },
                                                    { label: 'Experience', value: analysis.breakdown.experience, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{item.label}</p>
                                                        <div className="flex items-end gap-2">
                                                            <p className={`text-4xl font-bold ${item.color}`}>{Math.round(item.value)}%</p>
                                                        </div>
                                                        <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${item.color.replace('text', 'bg')}`}
                                                                style={{ width: `${item.value}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Strengths & Gaps Section */}
                                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                                <span className="w-1.5 h-8 bg-emerald-400 rounded-full"></span>
                                                Key Strengths
                                            </h3>
                                            <ul className="space-y-4">
                                                {analysis.strengths.map((s, i) => (
                                                    <li key={i} className="flex gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-gray-700">
                                                        <span className="text-emerald-500 font-bold">✓</span>
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                                <span className="w-1.5 h-8 bg-red-400 rounded-full"></span>
                                                Identified Gaps
                                            </h3>
                                            <ul className="space-y-4">
                                                {analysis.gaps.map((g, i) => (
                                                    <li key={i} className="flex gap-4 p-4 bg-red-50/50 rounded-2xl border border-red-100/50 text-gray-700">
                                                        <span className="text-red-500 font-bold">!</span>
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
            </div>
        </div>
    );
}
