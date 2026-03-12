"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { HiOutlineDocumentText, HiOutlineCalendar, HiOutlineLightBulb, HiOutlineExclamationCircle, HiArrowLeft } from "react-icons/hi";
import { showCustomToast } from "@/app/components/CustomToast";
import { useRouter } from "next/navigation";
import Timer from "@/app/components/Timer";

export default function ResumePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [resume, setResume] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingAts, setCheckingAts] = useState(false);
    const [atsScoreData, setAtsScoreData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await fetch(`/api/resumes/${id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) throw new Error("Failed to fetch resume");

                const result = await res.json();
                setResume(result);
                if (result.atsScore) {
                    try {
                        const parsedAts = typeof result.atsScore === 'string' ? JSON.parse(result.atsScore) : result.atsScore;
                        setAtsScoreData(parsedAts);
                    } catch (e) {
                        console.error('Failed to parse ATS score', e);
                    }
                }
                setLoading(false);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch resume");
                setLoading(false);
            }
        };

        if (id) {
            setLoading(true);
            fetchResume();
        }
    }, [id]);

    const deleteResume = async () => {
        showCustomToast.confirm(
            "Delete Resume?",
            "Deleting the resume will also delete its evaluations. Are you sure?",
            async () => {
                try {
                    setLoading(true);
                    const res = await fetch(`/api/resumes/${id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!res.ok) throw new Error("Failed to delete resume");
                    showCustomToast.success("Success!", "Resume deleted successfully");
                    router.back();
                } catch (error) {
                    setError(error instanceof Error ? error.message : "Failed to delete resume");
                    showCustomToast.error("Deletion Failed", "Failed to delete resume");
                } finally {
                    setLoading(false);
                }
            },
            "Confirm Delete"
        );
    };
    const checkAtsScore = async () => {
        try {
            setCheckingAts(true);
            const res = await fetch(`/api/ats`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeId: id })
            });
            if (!res.ok) throw new Error("Failed to check ATS friendliness");

            const result = await res.json();
            setAtsScoreData(result);
            showCustomToast.success("Success!", "ATS score calculated successfully!");
        } catch (error) {
            showCustomToast.error("Check Failed", error instanceof Error ? error.message : "Failed to calculate ATS score");
        } finally {
            setCheckingAts(false);
        }
    };

    if (!id) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mt-4">
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
                            <p className="text-gray-500 font-medium">Loading resume details...</p>
                        </div>
                    ) : error ? (
                        <div className="p-10 sm:p-20 text-center">
                            <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl inline-block max-w-md border border-red-500/20">
                                <h3 className="font-bold text-lg mb-2">Error Encountered</h3>
                                <p>{error}</p>
                            </div>
                        </div>
                    ) : resume ? (
                        <>
                            <div className="p-4 sm:p-6 lg:p-8 pb-0 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 min-w-0">
                                <div className="p-4 bg-orange-500/10 text-orange-400 rounded-2xl shrink-0">
                                    <HiOutlineDocumentText className="text-4xl" />
                                </div>
                                <div className="min-w-0 w-full">
                                    <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight break-words block">{resume.title}</h2>
                                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-2 sm:gap-4">
                                        <div className="flex items-center">
                                            <HiOutlineCalendar className="mr-1.5" />
                                            <span>Uploaded {new Date(resume.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Timer expiryDate={resume.expiresAt} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {atsScoreData && (
                                <div className="p-4 sm:p-6 lg:p-8 bg-[#22222e] border-t border-b border-[#2a2a3a]">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <HiOutlineLightBulb className="text-orange-400" />
                                                ATS Friendliness Check
                                            </h3>
                                            <p className="text-gray-400 mt-1">{atsScoreData.summary}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-3xl font-black text-orange-400">
                                                {atsScoreData.score}
                                                <span className="text-lg text-orange-400/60 font-bold">/100</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                                <span>Structure: {atsScoreData.breakdown?.structure}/50</span>
                                                <span>Content: {atsScoreData.breakdown?.content}/50</span>
                                            </div>
                                        </div>
                                    </div>

                                    {atsScoreData.improvements && atsScoreData.improvements.length > 0 && (
                                        <div className="bg-[#1a1a24] rounded-xl p-4 border border-[#2a2a3a]">
                                            <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                                                <HiOutlineExclamationCircle className="text-amber-400" />
                                                Suggested Improvements
                                            </h4>
                                            <ul className="space-y-2">
                                                {atsScoreData.improvements.map((improvement: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                                        <span className="text-orange-400 mt-0.5">•</span>
                                                        {improvement}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-4 sm:p-6 lg:p-8">
                                <iframe
                                    src={`/api/resumes/${id}/view#toolbar=0`}
                                    width="100%"
                                    height="700px"
                                    className="rounded-xl border border-[#2a2a3a]"
                                />

                                <div className="mt-10 pt-8 border-t border-[#2a2a3a] flex flex-wrap justify-end gap-3">
                                    {!atsScoreData && (
                                        <button
                                            onClick={checkAtsScore}
                                            disabled={checkingAts}
                                            className="px-6 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-blue-500/20"
                                        >
                                            {checkingAts ? (
                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></span>
                                            ) : <HiOutlineDocumentText className="text-lg" />}
                                            {checkingAts ? "Evaluating..." : "Check ATS Score"}
                                        </button>
                                    )}
                                    <button
                                        onClick={deleteResume}
                                        className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-colors border border-red-500/20"
                                    >
                                        Delete
                                    </button>
                                    <a
                                        href={`/api/resumes/${id}/download`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
