"use client";

import { JobsProps, JobType } from "@/utils/types";
import { FC, useEffect, useState } from "react";

const JobModal: FC<JobsProps> = ({ id, onClose }) => {
    const [job, setJob] = useState<JobType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/jobs/${id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) throw new Error("Failed to fetch job");

                const result = await res.json();
                setJob(result); // Directly set the result as job
                setLoading(false);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch job"
                );
                setLoading(false);
            }
        };

        if (id) {
            setLoading(true);
            fetchJob();
        }
    }, [id]);

    if (!id) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900 z-10 cursor-pointer"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading details...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center">
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block max-w-md">
                            <h3 className="font-bold text-lg mb-2">Error Encountered</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                ) : job ? (
                    <>
                        {/* Header */}
                        <div className="p-8 pb-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                    {job.status}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Added on {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">{job.title}</h2>
                            <p className="text-xl text-gray-500 font-medium mt-1">{job.company}</p>
                        </div>

                        {/* Content Grid */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl mb-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                    <p className="text-gray-900 font-semibold">{job.location || "Remote / Not specified"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salary Range</p>
                                    <p className="text-gray-900 font-semibold">{job.salary || "Not disclosed"}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {job.description && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                        Description
                                    </h3>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm bg-white border border-gray-100 p-6 rounded-2xl">
                                        {job.description}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {job.notes && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-yellow-400 rounded-full"></span>
                                        Personal Notes
                                    </h3>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm bg-yellow-50/50 border border-yellow-100 p-6 rounded-2xl italic">
                                        &quot;{job.notes}&quot;
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default JobModal;
