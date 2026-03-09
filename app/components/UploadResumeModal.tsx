"use client";

import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useState, useRef } from "react";
import { FiPlus, FiFile, FiX } from "react-icons/fi";
import { toast } from "sonner";

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
                toast.error("Please select a file first");
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
            toast.success("Resume uploaded successfully");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong during upload");
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
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
                                className={`w-full px-4 py-2 rounded-xl border ${touched.title && errors.title ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
                            />
                            <div className="flex justify-between items-start mt-1 min-h-[18px]">
                                {touched.title && errors.title ? (
                                    <p className="text-xs text-red-500">{errors.title}</p>
                                ) : <div />}
                                <span className="text-xs font-medium text-gray-400 ml-auto pl-2 shrink-0">
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
                                ${values.file ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400'}
                                ${dragActive ? 'border-blue-500 bg-blue-100/50 scale-[1.02]' : ''}
                            `}>
                                {values.file ? (
                                    <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <FiFile className="w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-gray-900">{values.file.name}</p>
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
                                            className="mt-2 text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
                                        >
                                            <FiX /> Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                            <FiPlus className="w-10 h-10" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-900">Upload Resume</p>
                                            <p className="text-sm text-gray-500 mt-1">Click or drag and drop your PDF or Word file here</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            {touched.file && errors.file && (
                                <p className="mt-2 text-center text-xs text-red-500">{errors.file}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            {isModal && onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 md:flex-none px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting || !values.file}
                                className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
