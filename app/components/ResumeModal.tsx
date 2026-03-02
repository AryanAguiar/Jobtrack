"use client";

import { ResumesProps, ResumeType } from "@/utils/types";
import { FC, useEffect, useState } from "react";
import { HiOutlineDocumentText, HiOutlineCalendar, HiOutlineHashtag, HiOutlineLightBulb, HiOutlineExclamationCircle } from "react-icons/hi";

const ResumeModal: FC<ResumesProps> = ({ id, onClose }) => {
    const [resume, setResume] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await fetch(`/api/resumes/${id}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) throw new Error("Failed to fetch resume");

                const result = await res.json();
                setResume(result);
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

        if (id) {
            setLoading(true);
            fetchResume();
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading resume details...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center">
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block max-w-md">
                            <h3 className="font-bold text-lg mb-2">Error Encountered</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                ) : resume ? (
                    <>
                        {/* Header */}
                        <div className="p-8 pb-0 flex items-start gap-5">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                                <HiOutlineDocumentText className="text-4xl" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">{resume.title}</h2>
                                <div className="flex items-center mt-2 text-sm text-gray-500 gap-4">
                                    <div className="flex items-center">
                                        <HiOutlineCalendar className="mr-1.5" />
                                        <span>Uploaded {new Date(resume.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <HiOutlineHashtag className="mr-1.5" />
                                        <span>{resume.fileName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Parsed Skills */}
                            {resume.parsedData?.skills && resume.parsedData.skills.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                                        Identified Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2 bg-gray-50 p-6 rounded-2xl">
                                        {resume.parsedData.skills.map((skill: string, i: number) => (
                                            <span
                                                key={i}
                                                className="bg-white border border-gray-100 px-3 py-1.5 rounded-xl text-sm text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow cursor-default"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {resume.parsedData?.experience && (
                                    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                        <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <HiOutlineLightBulb className="text-yellow-500 text-xl" />
                                            Experience Highlight
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed italic">
                                            {Array.isArray(resume.parsedData.experience) ? resume.parsedData.experience[0] : resume.parsedData.experience}
                                        </p>
                                    </div>
                                )}

                                {resume.parsedData?.education && (
                                    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                        <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <HiOutlineExclamationCircle className="text-blue-500 text-xl" />
                                            Education Info
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {typeof resume.parsedData.education === 'string' ? resume.parsedData.education : JSON.stringify(resume.parsedData.education)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Footer */}
                            <div className="mt-10 pt-8 border-t border-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                                <a
                                    href={resume.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                                >
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ResumeModal;
