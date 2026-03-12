"use client";

import { useEffect, useState } from "react";
import { JobType, ResumeType } from "@/utils/types";
import { Autocomplete, TextField, Box, Typography, CircularProgress } from "@mui/material";
import { toast } from "sonner";
import { showCustomToast } from "./CustomToast";

interface AnalyzeResumeForJobProps {
    isModal?: boolean;
    onSuccess?: () => void;
    onClose?: () => void;
}

const darkMuiSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#22222e',
        color: '#f1f1f4',
        '& fieldset': { borderColor: '#3a3a4a' },
        '&:hover fieldset': { borderColor: '#4a4a5a' },
        '&.Mui-focused fieldset': { borderColor: '#f97316', borderWidth: '2px' },
    },
    '& .MuiInputBase-input': { color: '#f1f1f4' },
    '& .MuiSvgIcon-root': { color: '#6b7280' },
};

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

            showCustomToast.success("Analysis started successfully!");
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred during analysis.";
            setError(errorMessage);
            showCustomToast.error("Analysis Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const darkPaperProps = {
        sx: {
            backgroundColor: '#22222e',
            border: '1px solid #3a3a4a',
            color: '#f1f1f4',
            '& .MuiAutocomplete-option': {
                color: '#f1f1f4',
                '&:hover': { backgroundColor: '#2a2a3a' },
                '&[aria-selected="true"]': { backgroundColor: '#3a3a4a' },
            },
        }
    };

    return (
        <div className="flex flex-col gap-6">

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm italic">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 ml-1">
                        Select Resume
                    </label>
                    <Autocomplete
                        options={resumes}
                        getOptionLabel={(option) => option.title}
                        value={selectedResume}
                        onChange={(_, newValue) => setSelectedResume(newValue)}
                        disabled={fetching || loading}
                        sx={{
                            width: "100%",
                            "& .MuiAutocomplete-paper": {
                                maxWidth: "100%",
                            }
                        }}
                        componentsProps={{ paper: darkPaperProps }}
                        ListboxProps={{
                            sx: {
                                maxHeight: 280,
                                overflowY: "auto"
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search and select a resume..."
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {fetching ? <CircularProgress size={20} sx={{ color: '#f97316' }} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                                sx={darkMuiSx}
                            />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props;

                            return (
                                <Box
                                    component="li"
                                    key={key}
                                    {...optionProps}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        py: 1,
                                        maxWidth: "100%",
                                        overflow: "hidden"
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        sx={{
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            color: '#f1f1f4'
                                        }}
                                    >
                                        {option.title}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            color: '#9ca3af'
                                        }}
                                    >
                                        {option.fileName}
                                    </Typography>
                                </Box>
                            );
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300 ml-1">
                        Select Job
                    </label>
                    <Autocomplete
                        options={jobs}
                        getOptionLabel={(option) => `${option.title} at ${option.company}`}
                        value={selectedJob}
                        onChange={(_, newValue) => setSelectedJob(newValue)}
                        disabled={fetching || loading}
                        sx={{
                            width: "100%",
                            "& .MuiAutocomplete-paper": {
                                maxWidth: "100%",
                            }
                        }}
                        componentsProps={{ paper: darkPaperProps }}
                        ListboxProps={{
                            sx: {
                                maxHeight: 280,
                                overflowY: "auto"
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search and select a job position..."
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {fetching ? (
                                                <CircularProgress size={20} sx={{ color: '#f97316' }} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                                sx={darkMuiSx}
                            />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props;

                            return (
                                <Box
                                    component="li"
                                    key={key}
                                    {...optionProps}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        py: 1,
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        sx={{
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            color: '#f1f1f4'
                                        }}
                                    >
                                        {option.title}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            width: "100%",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            color: '#9ca3af'
                                        }}
                                    >
                                        {option.company}
                                    </Typography>
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
                            className="flex-1 px-6 py-3 rounded-xl border border-[#3a3a4a] text-gray-400 font-semibold hover:bg-[#22222e] transition-all cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 bg-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
