"use client";

import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { HiOutlineDocumentText, HiOutlineCalendar, HiOutlineHashtag, HiOutlineLightBulb, HiOutlineExclamationCircle, HiArrowLeft } from "react-icons/hi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Timer from "@/app/components/Timer";

export default function ResumePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [resume, setResume] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingAts, setCheckingAts] = useState(false);
    const [atsScoreData, setAtsScoreData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {

        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) throw new Error("Failed to fetch user");

                const result = await res.json();
                setUser(result);
                setLoading(false);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch user"
                );
                setLoading(false);
            }
        }

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
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch resume"
                );
                setLoading(false);
            }
        };

        fetchUser();
        if (id) {
            setLoading(true);
            fetchResume();
        }
    }, [id]);

    const deleteResume = async () => {
        toast("Are you sure you want to delete this resume?, Deleting the resume will also delete it's evaluations", {
            action: {
                label: 'Confirm',
                onClick: async () => {
                    try {
                        setLoading(true);
                        const res = await fetch(`/api/resumes/${id}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        });
                        if (!res.ok) throw new Error("Failed to delete resume");
                        toast.success("Resume deleted successfully");
                        router.back();
                    } catch (error) {
                        setError(error instanceof Error ? error.message : "Failed to delete resume");
                        toast.error("Failed to delete resume");
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
            toast.success("ATS score calculated successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to calculate ATS score");
        } finally {
            setCheckingAts(false);
        }
    };

    if (!id) return null;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Navbar userName={user?.name || "Loading..."} />

                <div className="mt-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group cursor-pointer"
                    >
                        <HiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loading ? (
                            <div className="p-10 sm:p-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading resume details...</p>
                            </div>
                        ) : error ? (
                            <div className="p-10 sm:p-20 text-center">
                                <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block max-w-md">
                                    <h3 className="font-bold text-lg mb-2">Error Encountered</h3>
                                    <p>{error}</p>
                                </div>
                            </div>
                        ) : resume ? (
                            <>

                                <div className="p-4 sm:p-6 lg:p-8 pb-0 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 min-w-0">
                                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
                                        <HiOutlineDocumentText className="text-4xl" />
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 leading-tight break-words block">{resume.title}</h2>
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
                                    <div className="p-4 sm:p-6 lg:p-8 bg-blue-50/50 border-t border-b border-blue-100">
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <HiOutlineLightBulb className="text-blue-500" />
                                                    ATS Friendliness Check
                                                </h3>
                                                <p className="text-gray-600 mt-1">{atsScoreData.summary}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-3xl font-black text-blue-600">
                                                    {atsScoreData.score}
                                                    <span className="text-lg text-blue-400 font-bold">/100</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                                    <span>Structure: {atsScoreData.breakdown?.structure}/50</span>
                                                    <span>Content: {atsScoreData.breakdown?.content}/50</span>
                                                </div>
                                            </div>
                                        </div>

                                        {atsScoreData.improvements && atsScoreData.improvements.length > 0 && (
                                            <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                                                <h4 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                                    <HiOutlineExclamationCircle className="text-amber-500" />
                                                    Suggested Improvements
                                                </h4>
                                                <ul className="space-y-2">
                                                    {atsScoreData.improvements.map((improvement: string, i: number) => (
                                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                            <span className="text-blue-500 mt-0.5">•</span>
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
                                        className="rounded-xl border border-gray-200 shadow-sm"
                                    />

                                    <div className="mt-10 pt-8 border-t border-gray-50 flex flex-wrap justify-end gap-3">
                                        {!atsScoreData && (
                                            <button
                                                onClick={checkAtsScore}
                                                disabled={checkingAts}
                                                className="px-6 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {checkingAts ? (
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                                                ) : <HiOutlineDocumentText className="text-lg" />}
                                                {checkingAts ? "Evaluating..." : "Check ATS Score"}
                                            </button>
                                        )}
                                        <button
                                            onClick={deleteResume}
                                            className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors shadow-sm"
                                        >
                                            Delete
                                        </button>
                                        <a
                                            href={`/api/resumes/${id}/download`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
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
        </div>
    );
};


