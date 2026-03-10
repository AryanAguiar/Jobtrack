"use client";

import Navbar from "@/app/components/Navbar";
import { JobType } from "@/utils/types";
import { use, useEffect, useState, useCallback } from "react";
import { HiArrowLeft, HiX } from "react-icons/hi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import JobForm from "@/app/components/JobForm";

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [job, setJob] = useState<JobType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    }, []);

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
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch job"
            );
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
        if (id) {
            setLoading(true);
            fetchJob();
        }
    }, [id, fetchUser, fetchJob]);

    const deleteJob = async () => {
        toast('Are you sure you want to delete this job?', {
            action: {
                label: 'Confirm',
                onClick: async () => {
                    try {
                        setLoading(true);
                        const res = await fetch(`/api/jobs/${id}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        });
                        if (!res.ok) throw new Error("Failed to delete job");
                        toast.success("Job deleted successfully");
                        router.back();
                    } catch (error) {
                        setError(error instanceof Error ? error.message : "Failed to delete job");
                        toast.error("Failed to delete job");
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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading details...</p>
                            </div>
                        ) : error ? (
                            <div className="p-10 sm:p-20 text-center">
                                <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block max-w-md">
                                    <h3 className="font-bold text-lg mb-2">Error Encountered</h3>
                                    <p>{error}</p>
                                </div>
                            </div>
                        ) : job ? (
                            <>
                                <div className="p-4 sm:p-8 pb-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                            {job.status}
                                        </span>
                                        <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                                            {job.type?.replace("_", " ")}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-auto">
                                            Added {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight break-words">{job.title}</h2>
                                            <p className="text-lg sm:text-2xl text-gray-500 font-medium mt-1 break-words">{job.company}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={deleteJob}
                                                className="inline-flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all text-sm"
                                            >
                                                Delete
                                            </button>
                                            {job.link && (
                                                <a
                                                    href={job.link.startsWith("http") ? job.link : `https://${job.link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 text-sm"
                                                >
                                                    Apply Now
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 lg:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                            <p className="text-gray-900 font-semibold break-words">{job.location || "Remote / Not specified"}</p>
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salary Range</p>
                                            <p className="text-gray-900 font-semibold break-words">{job.salary || "Not disclosed"}</p>
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Type</p>
                                            <p className="text-gray-900 font-semibold break-words">{job.type?.replace("_", " ") || "Full Time"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        {job.description && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                                                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                                    Job Description
                                                </h3>
                                                <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
                                                    {job.description}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {job.requirements && (
                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                                                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                                        Requirements
                                                    </h3>
                                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
                                                        {job.requirements}
                                                    </div>
                                                </div>
                                            )}

                                            {job.responsibilities && (
                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                                                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                                        Responsibilities
                                                    </h3>
                                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
                                                        {job.responsibilities}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {job.notes && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                                                    <span className="w-1.5 h-6 bg-yellow-400 rounded-full"></span>
                                                    Personal Notes
                                                </h3>
                                                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm bg-yellow-50/30 border border-yellow-100/50 p-8 rounded-2xl italic relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14H15.017C13.9124 14 13.017 13.1046 13.017 12V6C13.017 4.89543 13.9124 4 15.017 4H21.017C22.1216 4 23.017 4.89543 23.017 6V12C23.017 13.1046 22.1216 14 21.017 14H21.017V16C21.017 18.7614 18.7784 21 16.017 21H14.017ZM1.017 21L1.017 18C1.017 16.8954 1.91243 16 3.017 16H6.017V14H2.017C0.912431 14 0.017 13.1046 0.017 12V6C0.017 4.89543 0.912431 4 2.017 4H8.017C9.12157 4 10.017 4.89543 10.017 6V12C10.017 13.1046 9.12157 14 8.017 14H8.017V16C8.017 18.7614 5.77857 21 3.017 21H1.017Z" />
                                                        </svg>
                                                    </div>
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
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Edit Job Opportunity</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
};

