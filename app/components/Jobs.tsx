import { FC, useEffect, useState } from "react";
import { JobsProps, JobType } from "@/utils/types";
import { IoAddCircleOutline } from "react-icons/io5";
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineCurrencyDollar } from "react-icons/hi";
import Link from "next/link";
import JobForm from "./JobForm";

const Jobs: FC<JobsProps> = ({ id }) => {
    const [data, setData] = useState<JobType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/jobs", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to fetch jobs");
            const result = await res.json();
            setData(result.data ?? []);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

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
        fetchJobs();
    }, []);

    return (
        <>
            <div className="lg:rounded-3xl overflow-hidden lg:bg-glass flex flex-col h-full lg:shadow-2xl">
                <div className="p-4 lg:p-6 flex items-center justify-between lg:border-b border-[#2a2a3a]/50 mb-2 lg:mb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-orange-gradient rounded-full" />
                        <h1 className="text-xl font-bold text-white tracking-tight">Recent Jobs</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setOpen(true)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group cursor-pointer"
                        >
                            <IoAddCircleOutline className="text-2xl text-gray-400 group-hover:text-orange-400 transition-colors" />
                        </button>

                        <Link href="/jobs" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20">
                            View All
                        </Link>
                    </div>
                </div>

                <div className="px-4 lg:p-6 pb-6 lg:overflow-y-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                            <p className="text-sm text-gray-500 font-medium">Fetching jobs...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/5 text-red-400 p-6 rounded-2xl text-sm border border-red-500/10 backdrop-blur-md">{error}</div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <p className="text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-full">No jobs tracked yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {data.slice(0, 4).map((job) => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                                    <div className="bg-[#22222e]/40 border border-[#2a2a3a]/30 rounded-2xl p-5 hover:bg-[#2a2a3a]/40 hover:border-orange-500/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                        {/* Subtle hover gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-orange-500/0 group-hover:from-orange-500/[0.02] group-hover:to-orange-500/[0.02] transition-colors pointer-events-none" />

                                        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-lg font-bold text-gray-100 group-hover:text-orange-400 transition-colors truncate leading-tight mb-2.5">
                                                    {job.title}
                                                </h2>
                                                <div className="flex items-center text-sm text-gray-400 font-medium bg-white/5 py-1 px-3 rounded-lg border border-white/5 w-fit">
                                                    <HiOutlineBriefcase className="mr-2 text-orange-500/70 shrink-0" />
                                                    <span className="truncate">{job.company}</span>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <span className="text-[10px] uppercase tracking-[0.15em] font-black bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/20 backdrop-blur-md shadow-sm">
                                                    {job.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 relative z-10 pt-4 border-t border-white/5">
                                            <div className="flex items-center text-xs text-gray-500 font-medium">
                                                <HiOutlineLocationMarker className="mr-1.5 text-orange-500/40 shrink-0" />
                                                <span className="truncate">{job.location}</span>
                                            </div>
                                            {job.salary && (
                                                <div className="flex items-center text-xs text-gray-400 font-bold bg-green-500/5 px-2.5 py-1 rounded-full border border-green-500/10">
                                                    <HiOutlineCurrencyDollar className="mr-1 text-green-500/70 shrink-0" />
                                                    <span className="truncate">{job.salary}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {open && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-xl p-4">
                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
                        <div className="p-6 border-b border-[#2a2a3a] flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Add New Job</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Fill in the details for the new position</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 bg-[#22222e] hover:bg-[#2a2a3a] rounded-full text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <JobForm isModal={true} onSuccess={() => { fetchJobs(); setOpen(false); }} onClose={() => setOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Jobs;
