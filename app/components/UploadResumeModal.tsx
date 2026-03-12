"use client";

import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useState, useRef } from "react";
import { FiPlus, FiFile, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { showCustomToast } from "./CustomToast";

const validationSchema = Yup.object({
    title: Yup.string().max(150, "Title must be 150 characters or less").required("Title is required"),
    file: Yup.mixed().required("File is required"),
});

export default function UploadResumeModal({ isModal = false, onSuccess, onClose }: { isModal?: boolean; onSuccess?: () => void; onClose?: () => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = async (values: any) => {
        try {
            // Check if file is selected
            if (!values.file) {
                showCustomToast.error("Selection Required", "Please select a file first");
                return;
            }

            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("file", values.file);

            const response = await fetch("/api/resumes", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to upload resume");
            }
            const data = await response.json();
            console.log(data);
            showCustomToast.success("Success!", "Resume uploaded successfully");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            showCustomToast.error("Upload Failed", error.message || "Something went wrong during upload");
        }
    }

    if (!isModal) return null;

    return (
        <div className="p-1">
            <Formik
                initialValues={{
                    title: "",
                    file: null as File | null,
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        await handleSubmit(values);
                    } catch (error: any) {
                        console.error(error);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, setFieldValue, values, errors, touched }) => (
                    <Form className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                                Resume Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                maxLength={150}
                                value={values.title}
                                onChange={(e) => setFieldValue("title", e.target.value)}
                                placeholder="e.g. Software Engineer Resume 2024"
                                className={`w-full px-4 py-2 rounded-xl border ${touched.title && errors.title ? 'border-red-500' : 'border-[#3a3a4a]'} bg-[#22222e] text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all`}
                            />
                            <div className="flex justify-between items-start mt-1 min-h-[18px]">
                                {touched.title && errors.title ? (
                                    <p className="text-xs text-red-400">{errors.title}</p>
                                ) : <div />}
                                <span className="text-xs font-medium text-gray-600 ml-auto pl-2 shrink-0">
                                    {150 - (values.title?.length || 0)} characters left
                                </span>
                            </div>
                        </div>

                        <div
                            className={`relative group cursor-pointer`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    const file = e.dataTransfer.files[0];
                                    setFieldValue("file", file);
                                    if (!values.title) setFieldValue("title", file.name.replace(/\.[^/.]+$/, ""));
                                }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setFieldValue("file", file);
                                        if (!values.title) setFieldValue("title", file.name.replace(/\.[^/.]+$/, ""));
                                    }
                                }}
                            />

                            <div className={`
                                w-full aspect-[4/3] md:aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-300
                                ${values.file ? 'border-orange-500 bg-orange-500/5' : 'border-[#3a3a4a] bg-[#22222e] hover:bg-[#2a2a3a] hover:border-orange-500/50'}
                                ${dragActive ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' : ''}
                            `}>
                                {values.file ? (
                                    <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                                        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400">
                                            <FiFile className="w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-white">{values.file.name}</p>
                                            <p className="text-sm text-gray-500">{(values.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFieldValue("file", null);
                                                setFieldValue("title", "");
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            className="mt-2 text-sm text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
                                        >
                                            <FiX /> Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-[#2a2a3a] rounded-2xl border border-[#3a3a4a] flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                            <FiPlus className="w-10 h-10" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-white">Upload Resume</p>
                                            <p className="text-sm text-gray-500 mt-1">Click or drag and drop your PDF or Word file here</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            {touched.file && errors.file && (
                                <p className="mt-2 text-center text-xs text-red-400">{errors.file}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            {isModal && onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-8 py-3 rounded-xl border border-[#3a3a4a] text-gray-400 font-semibold hover:bg-[#22222e] transition-all cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting || !values.file}
                                className="flex-1 md:flex-none px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-[#3a3a4a] disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Upload"
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
