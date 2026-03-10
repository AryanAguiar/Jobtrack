"use client";

import { useState } from "react";
import { jobFormValues } from "@/utils/types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineCash, HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineAcademicCap, HiOutlineOfficeBuilding, HiOutlineLink, HiOutlineAnnotation, HiOutlinePencilAlt, HiOutlineArrowLeft, HiOutlineGlobeAlt } from "react-icons/hi";
import { Autocomplete, TextField } from "@mui/material";
import { toast } from "sonner";

const validationSchema = Yup.object({
    title: Yup.string().min(5, "Title must be at least 5 characters").max(200, "Title must be 200 characters or less").required("Title is required"),
    company: Yup.string().min(3, "Company must be at least 3 characters").max(100, "Company must be 100 characters or less").required("Company is required"),
    location: Yup.string().min(4, "Location must be at least 4 characters").max(200, "Location must be 200 characters or less").required("Location is required"),
    description: Yup.string().min(20, "Description must be at least 20 characters").required("Description is required").max(5000, "Description must be 5000 characters or less"),
    requirements: Yup.string().min(20, "Requirements must be at least 20 characters").required("Requirements is required").max(5000, "Requirements must be 5000 characters or less"),
    responsibilities: Yup.string().min(20, "Responsibilities must be at least 20 characters").required("Responsibilities is required").max(5000, "Responsibilities must be 5000 characters or less"),
    salary: Yup.string().nullable().transform((v, o) => o === "" ? null : v).max(80, "Salary must be 80 characters or less"),
    type: Yup.string().required("Type is required"),
    status: Yup.string().required("Status is required"),
    notes: Yup.string().max(2000, "Notes must be 2000 characters or less"),
    link: Yup.string().url("Please enter a valid URL (include http:// or https://)").nullable().transform((v, o) => (o === "" ? null : v)),
});

const jobTypeOptions = [
    { label: "Full-time", value: "FULL_TIME" },
    { label: "Part-time", value: "PART_TIME" },
    { label: "Contract", value: "CONTRACT" },
    { label: "Freelance", value: "FREELANCE" },
    { label: "Internship", value: "INTERNSHIP" }
];

const jobStatusOptions = [
    { label: "Applied", value: "APPLIED" },
    { label: "Interview", value: "INTERVIEW" },
    { label: "Offered", value: "OFFERED" },
    { label: "Rejected", value: "REJECTED" },
    { label: "Withdrawn", value: "WITHDRAWN" }
];

const emptyValues = {
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    responsibilities: "",
    salary: "",
    type: "",
    status: "",
    link: "",
    notes: ""
};

const FormField = ({ label, name, type = "text", placeholder, icon: Icon, as, maxLength }: { label: string, name: string, type?: string, placeholder?: string, icon?: any, as?: string, maxLength?: number }) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={name} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {Icon && <Icon className="text-blue-500 w-4 h-4" />}
            {label}
        </label>
        <div className="relative">
            <Field name={name}>
                {({ field }: any) => (
                    <>
                        <input
                            {...field}
                            type={as ? undefined : type}
                            as={as}
                            maxLength={maxLength}
                            placeholder={placeholder}
                            className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400 ${as === 'textarea' ? 'min-h-[120px] resize-y' : ''}`}
                        />
                        <div className="flex justify-between items-start mt-1.5 min-h-[18px]">
                            <ErrorMessage name={name} component="p" className="text-xs font-medium text-red-500" />
                            {maxLength && (
                                <span className="text-xs font-medium text-gray-400 ml-auto pl-2 shrink-0">
                                    {maxLength - (field.value?.length || 0)} characters left
                                </span>
                            )}
                        </div>
                    </>
                )}
            </Field>
        </div>
    </div>
);

export default function JobForm({ isModal = false, onSuccess, onClose, initialData, jobId }: { isModal?: boolean; onSuccess?: () => void; onClose?: () => void; initialData?: any; jobId?: string }) {
    const handleSubmit = async (values: jobFormValues) => {
        try {
            const url = jobId ? `/api/jobs/${jobId}` : "/api/jobs";
            const method = jobId ? "PATCH" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to ${jobId ? 'update' : 'create'} job`);
            }
            const data = await response.json();
            console.log(data);
            toast.success(`Job ${jobId ? 'updated' : 'created'} successfully`);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || `Failed to ${jobId ? 'update' : 'create'} job`);
        }
    }

    const formContent = (
        <Formik
            initialValues={initialData || emptyValues}
            enableReinitialize
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
                <Form className={isModal ? "space-y-4" : "p-8 space-y-6"}>
                    <div className={`grid grid-cols-1 md:grid-cols-2 ${isModal ? 'gap-4' : 'gap-6'}`}>
                        <FormField
                            label="Job Title"
                            name="title"
                            placeholder="e.g. Senior Frontend Developer"
                            icon={HiOutlineBriefcase}
                            maxLength={200}
                        />
                        <FormField
                            label="Company"
                            name="company"
                            placeholder="e.g. TechCorp Solutions"
                            icon={HiOutlineOfficeBuilding}
                            maxLength={100}
                        />
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-3 ${isModal ? 'gap-4' : 'gap-6'}`}>
                        <FormField
                            label="Location"
                            name="location"
                            placeholder={isModal ? "e.g. Remote / NY" : "e.g. Remote / New York, NY"}
                            icon={HiOutlineLocationMarker}
                            maxLength={200}
                        />
                        <FormField
                            label="Salary"
                            name="salary"
                            placeholder="e.g. 120,000 / Negotiable"
                            icon={HiOutlineCash}
                            maxLength={80}
                        />
                        <div className={`grid grid-cols-2 ${isModal ? 'gap-2' : 'gap-4'}`}>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="type" className="text-sm font-semibold text-gray-700">Type</label>
                                <Autocomplete
                                    options={jobTypeOptions}
                                    getOptionLabel={(option) => option.label}
                                    value={jobTypeOptions.find(o => o.value === values.type) || null}
                                    onChange={(_, newValue) => setFieldValue("type", newValue?.value || "")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={isModal ? "Type" : "Select Type"}
                                            size={isModal ? "small" : undefined}
                                            error={!!(errors.type && touched.type)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: isModal ? '8px' : '12px',
                                                    backgroundColor: '#f9fafb',
                                                    ...(isModal ? { fontSize: '0.875rem' } : {}),
                                                    '& fieldset': { borderColor: '#e5e7eb' },
                                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                                },
                                            }}
                                        />
                                    )}
                                />
                                <ErrorMessage name="type" component="p" className={`${isModal ? 'text-[10px]' : 'text-xs'} font-medium text-red-500`} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="status" className="text-sm font-semibold text-gray-700">Status</label>
                                <Autocomplete
                                    options={jobStatusOptions}
                                    getOptionLabel={(option) => option.label}
                                    value={jobStatusOptions.find(o => o.value === values.status) || null}
                                    onChange={(_, newValue) => setFieldValue("status", newValue?.value || "")}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={isModal ? "Status" : "Select Status"}
                                            size={isModal ? "small" : undefined}
                                            error={!!(errors.status && touched.status)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: isModal ? '8px' : '12px',
                                                    backgroundColor: '#f9fafb',
                                                    ...(isModal ? { fontSize: '0.875rem' } : {}),
                                                    '& fieldset': { borderColor: '#e5e7eb' },
                                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                                },
                                            }}
                                        />
                                    )}
                                />
                                <ErrorMessage name="status" component="p" className={`${isModal ? 'text-[10px]' : 'text-xs'} font-medium text-red-500`} />
                            </div>
                        </div>
                    </div>

                    <div className={isModal ? "space-y-4" : "space-y-6"}>
                        <FormField
                            label="Description"
                            name="description"
                            as="textarea"
                            placeholder={isModal ? "Detailed description..." : "Detailed description of the role..."}
                            icon={HiOutlineDocumentText}
                            maxLength={5000}
                        />

                        <FormField
                            label="Requirements"
                            name="requirements"
                            as="textarea"
                            placeholder={isModal ? "Key requirements..." : "Key requirements for candidates..."}
                            icon={HiOutlineAcademicCap}
                            maxLength={5000}
                        />

                        <FormField
                            label="Responsibilities"
                            name="responsibilities"
                            as="textarea"
                            placeholder={isModal ? "Day-to-day..." : "Day-to-day responsibilities..."}
                            icon={HiOutlineClipboardList}
                            maxLength={5000}
                        />

                        <FormField
                            label="Notes"
                            name="notes"
                            as="textarea"
                            placeholder={isModal ? "Notes..." : "Personal notes..."}
                            icon={HiOutlineAnnotation}
                            maxLength={2000}
                        />

                        <FormField
                            label="Link"
                            name="link"
                            type="url"
                            placeholder={isModal ? "https://company.com/job" : "https://company.com/job-posting"}
                            icon={HiOutlineLink}
                        />
                    </div>

                    <div className={`flex items-center justify-end gap-${isModal ? '3' : '4'} pt-4 border-t border-gray-100`}>
                        {((isModal && onClose) || (!isModal && onClose)) && (
                            <button
                                type="button"
                                onClick={onClose}
                                className={`${isModal ? 'w-full md:w-auto px-6 py-2.5' : 'px-8 py-3'} rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all cursor-pointer`}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${isModal ? 'w-full md:w-auto px-6 py-2.5' : 'px-8 py-3'} bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all ${!isModal ? 'transform active:scale-[0.98] disabled:transform-none' : ''} flex items-center ${isModal ? 'justify-center' : ''} gap-2 cursor-pointer`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className={`${isModal ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
                                    Submitting...
                                </>
                            ) : (
                                jobId ? "Update Job Opportunity" : "Create Job Opportunity"
                            )}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );

    if (isModal) {
        return <div className="bg-white">{formContent}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">Create New Job</h2>
                    <p className="text-blue-100 text-sm mt-1">Fill in the details below to post a new job opening.</p>
                </div>
                {formContent}
            </div>
        </div>
    );
}
