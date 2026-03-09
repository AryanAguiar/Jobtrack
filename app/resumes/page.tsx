"use client";
import { useEffect, useState } from "react";
import { ResumeType } from "@/utils/types";
import Link from "next/link";
import { HiArrowLeft, HiMagnifyingGlass, HiChevronUpDown, HiOutlineBriefcase, HiOutlineClock, HiPlus, HiOutlineTrash } from "react-icons/hi2";
import Navbar from "../components/Navbar";
import { Autocomplete, TextField } from "@mui/material";
import UploadResumeModal from "../components/UploadResumeModal";
import { toast } from "sonner";
import Timer from "../components/Timer";
import { useRouter } from "next/navigation";

const sortOptions = [
    { label: "Date", value: "createdAt" },
    { label: "Title", value: "title" }
];

export default function ResumesPage() {
    const router = useRouter();
    const [data, setData] = useState<ResumeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortKey, setSortKey] = useState<"createdAt" | "title">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const limit = 9;

    useEffect(() => {
        if (isUploadModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isUploadModalOpen]);

    // Debounce search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchResumes = async () => {
            setError(null);
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    sortKey,
                    sortOrder,
                });
                if (debouncedSearch) queryParams.append("search", debouncedSearch);

                const res = await fetch(`/api/resumes?${queryParams.toString()}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    throw new Error("Failed to fetch resumes");
                }
                const result = await res.json();
                setData(result.data ?? []);
                setTotalPages(result.meta?.totalPages ?? 1);
                setLoading(false);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch resumes");
                setLoading(false);
            }
        };

        fetchResumes();
    }, [page, debouncedSearch, sortKey, sortOrder]);

    const deleteResume = async (id: string) => {
        toast('Are you sure you want to delete this resume?', {
            action: {
                label: 'Confirm',
                onClick: async () => {
                    try {
                        setLoading(true);
                        const res = await fetch(`/api/resumes/${id}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        });
                        if (!res.ok) throw new Error("Failed to delete resume");
                        setData((prev) => prev.filter((item) => item.id !== id));
                        toast.success("Resume deleted successfully");
                    } catch (error) {
                        setError(error instanceof Error ? error.message : "Failed to delete resume");
                        toast.error("Failed to delete resume");
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

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Navbar userName={user?.name || "Loading..."} />

                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group cursor-pointer"
                    >
                        <HiArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search in resumes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 min-w-[200px]">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Sort by:</span>
                                <Autocomplete
                                    options={sortOptions}
                                    getOptionLabel={(option) => option.label}
                                    value={sortOptions.find(o => o.value === sortKey) || sortOptions[0]}
                                    onChange={(_, newValue) => {
                                        setSortKey(newValue ? newValue.value as any : "createdAt");
                                    }}
                                    disableClearable
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            variant="standard"
                                            InputProps={{
                                                ...params.InputProps,
                                                disableUnderline: true,
                                                sx: { fontSize: '0.875rem', fontWeight: 500, color: '#374151' }
                                            }}
                                            sx={{ width: '100px' }}
                                        />
                                    )}
                                />
                            </div>

                            <button
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                                title={sortOrder === "asc" ? "Ascending" : "Descending"}
                            >
                                <HiChevronUpDown className="text-lg" />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all text-sm cursor-pointer whitespace-nowrap"
                        >
                            <HiPlus className="text-lg" />
                            Upload Resume
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-10 sm:p-20 bg-white rounded-3xl border border-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading resumes...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center">
                            <p className="font-bold mb-2 text-lg">Failed to Load</p>
                            <p>{error}</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 sm:p-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineBriefcase className="text-3xl text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No resumes found</h3>
                            <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                                {searchQuery ? `No results matching "${searchQuery}"` : "You haven't uploaded any resumes yet."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.map((resume: ResumeType) => (
                                    <Link key={resume.id} href={`/resumes/${resume.id}`}>
                                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-600 transition-colors text-purple-600 group-hover:text-white transition-colors">
                                                    <HiOutlineBriefcase className="text-2xl" />
                                                </div>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                                    title="Delete Resume"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        deleteResume(resume.id);
                                                    }}
                                                >
                                                    <HiOutlineTrash className="text-xl" />
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                <h2 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                                                    {resume.title}
                                                </h2>

                                                <div className="mt-4 space-y-2">
                                                    {resume.parsedData?.skills && resume.parsedData.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {resume.parsedData.skills.slice(0, 3).map((skill, idx) => (
                                                                <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {resume.parsedData.skills.length > 3 && (
                                                                <span className="text-[10px] text-gray-400">+{resume.parsedData.skills.length - 3} more</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 text-xs text-gray-500 italic line-clamp-3 leading-relaxed">
                                                    {resume.parsedData?.experience && (Array.isArray(resume.parsedData.experience) ? resume.parsedData.experience.length > 0 : true)
                                                        ? (Array.isArray(resume.parsedData.experience) ? resume.parsedData.experience[0] : resume.parsedData.experience)
                                                        : "No detailed experience parsed."}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <Timer expiryDate={resume.expiresAt} />
                                            </div>

                                            <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <HiOutlineClock className="text-base" />
                                                    {new Date(resume.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <span className="text-purple-600 group-hover:underline cursor-pointer">View Details →</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === i + 1
                                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Upload Resume Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden relative flex flex-col text-gray-900 text-left">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Upload Resume</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Add a new resume to your library</p>
                            </div>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <UploadResumeModal
                                isModal={true}
                                onSuccess={() => {
                                    window.location.reload();
                                    setIsUploadModalOpen(false);
                                }}
                                onClose={() => setIsUploadModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}