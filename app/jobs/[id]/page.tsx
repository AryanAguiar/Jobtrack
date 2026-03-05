"use client";

import Navbar from "@/app/components/Navbar";
import { JobType } from "@/utils/types";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { HiArrowLeft } from "react-icons/hi";

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [job, setJob] = useState<JobType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

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


        const fetchJob = async () => {
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
        };


        fetchUser();
        if (id) {
            setLoading(true);
            fetchJob();
        }
    }, [id]);

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
                                <div className="p-8 pb-0">
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
                                        <div>
                                            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">{job.title}</h2>
                                            <p className="text-2xl text-gray-500 font-medium mt-1">{job.company}</p>
                                        </div>
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

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                            <p className="text-gray-900 font-semibold">{job.location || "Remote / Not specified"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Salary Range</p>
                                            <p className="text-gray-900 font-semibold">{job.salary || "Not disclosed"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Type</p>
                                            <p className="text-gray-900 font-semibold">{job.type?.replace("_", " ") || "Full Time"}</p>
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
        </div>
    );
};

