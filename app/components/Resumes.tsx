import { FC, useEffect, useState } from "react";
import { ResumeType, ResumesProps } from "@/utils/types";
import { IoAddCircleOutline } from "react-icons/io5";
import { HiOutlineDocumentText, HiOutlineCalendar, HiOutlineCloudDownload } from "react-icons/hi";
import Link from "next/link";
import ResumeModal from "./ResumeModal";

const Resumes: FC<ResumesProps> = ({ id }) => {
    const [data, setData] = useState<ResumeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedResume, setSelectedResume] = useState<string | null>(null);

    useEffect(() => {
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
        fetchResumes();
    }, []);

    return (
        <>
            <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex flex-col h-[500px]">
                <div className="p-5 flex items-center justify-between border-b border-gray-50">
                    <h1 className="text-lg font-bold text-gray-900 border-l-4 border-purple-500 pl-3">Recent Resumes</h1>
                    <div className="flex items-center gap-3">
                        <IoAddCircleOutline className="text-2xl text-gray-400 cursor-pointer hover:text-purple-500 transition-colors" />
                        <Link href="/dashboard/resumes" className="text-sm font-medium text-purple-600 hover:text-purple-700">View All</Link>
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
                                <div
                                    key={resume.id}
                                    onClick={() => setSelectedResume(resume.id)}
                                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <HiOutlineDocumentText className="text-2xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-sm font-bold text-gray-900 truncate">
                                                {resume.title}
                                            </h2>
                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                <HiOutlineCalendar className="mr-1.5" />
                                                <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="p-2 text-gray-400 group-hover:text-purple-600 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(resume.fileUrl, '_blank');
                                            }}
                                        >
                                            <HiOutlineCloudDownload className="text-xl" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {selectedResume && <ResumeModal id={selectedResume} onClose={() => setSelectedResume(null)} />}
        </>
    );
};

export default Resumes;