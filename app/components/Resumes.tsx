import { FC, useEffect, useState } from "react";
import { ResumeType, ResumesProps } from "@/utils/types";
import { IoAddCircleOutline } from "react-icons/io5";
import { HiOutlineDocumentText, HiOutlineCalendar, HiOutlineCloudDownload } from "react-icons/hi";
import Link from "next/link";
import UploadResumeModal from "./UploadResumeModal";


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
            <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col h-[500px]">
                <div className="p-5 flex items-center justify-between border-b border-gray-50">
                    <h1 className="text-lg font-bold text-gray-900 border-l-4 border-purple-500 pl-3">Recent Resumes</h1>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setOpen(true)}>
                            <IoAddCircleOutline className="text-2xl text-gray-400 cursor-pointer hover:text-purple-500 transition-colors" />
                        </button>
                        <Link href="/resumes" className="text-sm font-medium text-purple-600 hover:text-purple-700">View All</Link>
                    </div>
                </div>

                <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No resumes uploaded</p>
                        </div>
                    ) : (

                        <div className="flex flex-col gap-4">
                            {data.slice(0, 4).map((resume) => (
                                <Link key={resume.id} href={`/resumes/${resume.id}`}>
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer relative">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                    <HiOutlineDocumentText className="text-2xl" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-sm font-bold text-gray-900 truncate pr-10">
                                                        {resume.title}
                                                    </h2>
                                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                                        <HiOutlineCalendar className="mr-1.5" />
                                                        <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                    title="Download Resume"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        window.open(resume.fileUrl, '_blank');
                                                    }}
                                                >
                                                    <HiOutlineCloudDownload className="text-lg" />
                                                </button>
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden relative flex flex-col text-gray-900">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Upload Resume</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Add a new resume to your library</p>
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
