"use client";

import { JobType } from "@/utils/types";
import { use, useEffect, useState, useCallback } from "react";
import { HiArrowLeft, HiX } from "react-icons/hi";
import { showCustomToast } from "@/app/components/CustomToast";
import { useRouter } from "next/navigation";
import JobForm from "@/app/components/JobForm";

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [job, setJob] = useState<JobType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();

    const fetchJob = useCallback(async () => {
        try {
            const res = await fetch(`/api/jobs/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to fetch job");

            const result = await res.json();
            setJob(result);
            setLoading(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to fetch job");
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            setLoading(true);
            fetchJob();
        }
    }, [id, fetchJob]);

    const deleteJob = async () => {
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
                    showCustomToast.success("Success!", "Job deleted successfully");
                    router.back();
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
                            <p className="text-gray-500 font-medium">Loading details...</p>
                        </div>
                    ) : error ? (
                        <div className="p-10 sm:p-20 text-center">
                            <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl inline-block max-w-md border border-red-500/20">
                                <h3 className="font-bold text-lg mb-2">Error Encountered</h3>
                                <p>{error}</p>
                            </div>
                        </div>
                    ) : job ? (
                        <>
                            <div className="p-4 sm:p-8 pb-0">
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                        {job.status}
                                    </span>
                                    <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        {job.type?.replace("_", " ")}
                                    </span>
                                    <span className="text-xs text-gray-600 ml-auto">
                                        Added {new Date(job.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight break-words">{job.title}</h2>
                                        <p className="text-lg sm:text-2xl text-gray-500 font-medium mt-1 break-words">{job.company}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="inline-flex items-center justify-center px-6 py-3 bg-[#22222e] text-gray-300 font-bold rounded-xl hover:bg-[#2a2a3a] transition-all text-sm border border-[#3a3a4a]"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={deleteJob}
                                            className="inline-flex items-center justify-center px-6 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all text-sm border border-red-500/20"
                                        >
                                            Delete
                                        </button>
                                        {job.link && (
                                            <a
                                                href={job.link.startsWith("http") ? job.link : `https://${job.link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-sm"
                                            >
                                                Apply Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 lg:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#22222e] rounded-2xl mb-8 border border-[#2a2a3a]">
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</p>
                                        <p className="text-gray-200 font-semibold break-words">{job.location || "Remote / Not specified"}</p>
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Salary Range</p>
                                        <p className="text-gray-200 font-semibold break-words">{job.salary || "Not disclosed"}</p>
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Type</p>
                                        <p className="text-gray-200 font-semibold break-words">{job.type?.replace("_", " ") || "Full Time"}</p>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {job.description && (
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                                                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                                                Job Description
                                            </h3>
                                            <div className="text-gray-400 leading-relaxed whitespace-pre-line text-sm bg-[#22222e] border border-[#2a2a3a] p-8 rounded-2xl">
                                                {job.description}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {job.requirements && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                                                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                                    Requirements
                                                </h3>
                                                <div className="text-gray-400 leading-relaxed whitespace-pre-line text-sm bg-[#22222e] border border-[#2a2a3a] p-8 rounded-2xl">
                                                    {job.requirements}
                                                </div>
                                            </div>
                                        )}

                                        {job.responsibilities && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                                                    <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                                    Responsibilities
                                                </h3>
                                                <div className="text-gray-400 leading-relaxed whitespace-pre-line text-sm bg-[#22222e] border border-[#2a2a3a] p-8 rounded-2xl">
                                                    {job.responsibilities}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {job.notes && (
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                                                <span className="w-1.5 h-6 bg-yellow-400 rounded-full"></span>
                                                Personal Notes
                                            </h3>
                                            <div className="text-gray-400 leading-relaxed whitespace-pre-line text-sm bg-yellow-500/5 border border-yellow-500/10 p-8 rounded-2xl italic relative overflow-hidden">
                                                &quot;{job.notes}&quot;
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar">
                        <div className="sticky top-0 z-10 bg-[#1a1a24] border-b border-[#2a2a3a] px-8 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Edit Job Opportunity</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-[#22222e] rounded-full transition-colors"
                            >
                                <HiX className="text-xl text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 md:p-8">
                            <JobForm
                                isModal={true}
                                initialData={job}
                                jobId={id}
                                onClose={() => setIsEditModalOpen(false)}
                                onSuccess={() => {
                                    setIsEditModalOpen(false);
                                    fetchJob();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
