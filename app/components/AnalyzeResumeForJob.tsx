"use client";

import { useEffect, useState } from "react";
import { JobType, ResumeType } from "@/utils/types";
import { Autocomplete, TextField, Box, Typography, CircularProgress } from "@mui/material";

interface AnalyzeResumeForJobProps {
    isModal?: boolean;
    onSuccess?: () => void;
    onClose?: () => void;
}

export default function AnalyzeResumeForJob({ isModal, onSuccess, onClose }: AnalyzeResumeForJobProps) {
    const [resumes, setResumes] = useState<ResumeType[]>([]);
    const [jobs, setJobs] = useState<JobType[]>([]);
    const [selectedResume, setSelectedResume] = useState<ResumeType | null>(null);
    const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setFetching(true);
            try {
                const [resumesRes, jobsRes] = await Promise.all([
                    fetch("/api/resumes"),
                    fetch("/api/jobs")
                ]);

                if (resumesRes.ok) {
                    const resumesData = await resumesRes.json();
                    setResumes(resumesData.data || []);
                }
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    setJobs(jobsData.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load resumes or jobs.");
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResume || !selectedJob) {
            setError("Please select both a resume and a job.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/evaluations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resumeId: selectedResume.id,
                    jobId: selectedJob.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to analyze resume.");
            }

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm italic">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">
                        Select Resume
                    </label>
                    <Autocomplete
                        options={resumes}
                        getOptionLabel={(option) => option.title}
                        value={selectedResume}
                        onChange={(_, newValue) => setSelectedResume(newValue)}
                        disabled={fetching || loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search and select a resume..."
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {fetching ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#f9fafb',
                                        '& fieldset': { borderColor: '#e5e7eb' },
                                        '&:hover fieldset': { borderColor: '#d1d5db' },
                                        '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' },
                                    },
                                }}
                            />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                                <Box component="li" key={key} {...optionProps} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">{option.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{option.fileName}</Typography>
                                </Box>
                            );
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 ml-1">
                        Select Job
                    </label>
                    <Autocomplete
                        options={jobs}
                        getOptionLabel={(option) => `${option.title} at ${option.company}`}
                        value={selectedJob}
                        onChange={(_, newValue) => setSelectedJob(newValue)}
                        disabled={fetching || loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search and select a job position..."
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {fetching ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#f9fafb',
                                        '& fieldset': { borderColor: '#e5e7eb' },
                                        '&:hover fieldset': { borderColor: '#d1d5db' },
                                        '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' },
                                    },
                                }}
                            />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                                <Box component="li" key={key} {...optionProps} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">{option.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{option.company}</Typography>
                                </Box>
                            );
                        }}
                    />
                </div>

                <div className="pt-4 flex gap-3">
                    {isModal && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        disabled={loading || fetching || !selectedResume || !selectedJob}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={16} color="inherit" />
                                Analyzing...
                            </>
                        ) : (
                            "Start Analysis"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
