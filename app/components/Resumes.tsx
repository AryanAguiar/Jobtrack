import { FC, useEffect, useState } from "react";
import { ResumeType, ResumesProps } from "@/utils/types";
import { IoAddCircleOutline } from "react-icons/io5";
import { HiOutlineDocumentText, HiOutlineCalendar } from "react-icons/hi";
import Link from "next/link";
import UploadResumeModal from "./UploadResumeModal";
import Timer from "./Timer";

const Resumes: FC<ResumesProps> = ({ id }) => {
    const [data, setData] = useState<ResumeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const fetchResumes = async () => {
        try {
            const res = await fetch("/api/resumes", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to fetch resumes");
            const result = await res.json();
            setData(result.data ?? []);
            setLoading(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to fetch resumes");
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
        fetchResumes();
    }, []);

    return (
        <>
            <div className="lg:rounded-3xl overflow-hidden lg:bg-glass flex flex-col h-full lg:shadow-2xl">
                <div className="p-4 lg:p-6 flex items-center justify-between lg:border-b border-[#2a2a3a]/50 mb-2 lg:mb-0">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-orange-gradient rounded-full" />
                        <h1 className="text-xl font-bold text-white tracking-tight">Recent Resumes</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setOpen(true)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group cursor-pointer"
                        >
                            <IoAddCircleOutline className="text-2xl text-gray-400 group-hover:text-orange-400 transition-colors" />
                        </button>
                        <Link href="/resumes" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20">
                            View All
                        </Link>
                    </div>
                </div>

                <div className="px-4 lg:p-6 pb-6 lg:overflow-y-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                            <p className="text-sm text-gray-500 font-medium">Fetching resumes...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/5 text-red-400 p-6 rounded-2xl text-sm border border-red-500/10 backdrop-blur-md">{error}</div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <p className="text-gray-400 font-medium">No resumes uploaded yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {data.slice(0, 4).map((resume) => (
                                <Link key={resume.id} href={`/resumes/${resume.id}`} className="block">
                                    <div className="bg-[#22222e]/40 border border-[#2a2a3a]/30 rounded-2xl p-5 hover:bg-[#2a2a3a]/40 hover:border-orange-500/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-transparent to-orange-500/0 group-hover:from-orange-500/[0.02] group-hover:to-orange-500/[0.02] transition-colors pointer-events-none" />

                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className="hidden sm:block p-3 bg-white/5 text-orange-400 rounded-xl group-hover:bg-orange-gradient group-hover:text-white transition-all duration-300 shrink-0 border border-white/5 group-hover:border-transparent shadow-lg flex items-center justify-center">
                                                <HiOutlineDocumentText className="text-2xl" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="mb-2">
                                                    <h2 className="text-lg font-bold text-gray-100 group-hover:text-orange-400 transition-colors truncate breakout-words leading-tight">
                                                        {resume.title}
                                                    </h2>
                                                </div>

                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <Timer expiryDate={resume.expiresAt} />
                                                    </div>

                                                    <div className="inline-flex items-center self-start px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 shadow-sm">
                                                        <span className="text-xs text-gray-400 font-medium mr-1.5">ATS Score:</span>
                                                        <span className="text-sm font-bold text-orange-400">{resume.atsScore?.score ?? "N/A"}</span>
                                                    </div>

                                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                                        <HiOutlineCalendar className="mr-1.5 text-orange-500/50 shrink-0" />
                                                        <span>{new Date(resume.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
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
                    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden relative flex flex-col text-white">
                        <div className="p-6 border-b border-[#2a2a3a] flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Upload Resume</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Add a new resume to your library</p>
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
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <UploadResumeModal isModal={true} onSuccess={() => { fetchResumes(); setOpen(false); }} onClose={() => setOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Resumes;
