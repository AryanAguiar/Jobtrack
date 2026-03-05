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
            <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col h-[500px]">
                <div className="p-5 flex items-center justify-between border-b border-gray-50">
                    <h1 className="text-lg font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Recent Jobs</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(true)}>
                            <IoAddCircleOutline className="text-2xl text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
                        </button>

                        <Link href="/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
                    </div>
                </div>

                <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No jobs tracked yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {data.slice(0, 4).map((job) => (
                                <Link key={job.id} href={`/jobs/${job.id}`}>
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer relative">
                                        <div className="flex items-start justify-between">
                                            <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-12 truncate">
                                                {job.title}
                                            </h2>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                                    {job.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <HiOutlineBriefcase className="mr-2 text-gray-400 shrink-0" />
                                                <span className="font-medium">{job.company}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <HiOutlineLocationMarker className="mr-2 text-gray-400 shrink-0" />
                                                <span>{job.location}</span>
                                            </div>
                                            {job.salary && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <HiOutlineCurrencyDollar className="mr-2 text-gray-400 shrink-0" />
                                                    <span>{job.salary}</span>
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Add New Job</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Fill in the details for the new position</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
