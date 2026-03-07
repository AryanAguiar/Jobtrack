"use client";

import { jobFormValues } from "@/utils/types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineCash, HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineAcademicCap, HiOutlineOfficeBuilding, HiOutlineLink, HiOutlineAnnotation } from "react-icons/hi";
import { Autocomplete, TextField } from "@mui/material";
import { toast } from "sonner";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    company: Yup.string().required("Company is required"),
    location: Yup.string().required("Location is required"),
    description: Yup.string().required("Description is required"),
    requirements: Yup.string().required("Requirements is required"),
    responsibilities: Yup.string().required("Responsibilities is required"),
    salary: Yup.string(),
    type: Yup.string().required("Type is required"),
    status: Yup.string().required("Status is required"),
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

const FormField = ({ label, name, type = "text", placeholder, icon: Icon, as }: { label: string, name: string, type?: string, placeholder?: string, icon?: any, as?: string }) => (
    <div className="flex flex-col gap-1.5">
        <label htmlFor={name} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            {Icon && <Icon className="text-blue-500 w-4 h-4" />}
            {label}
        </label>
        <div className="relative">
            <Field
                name={name}
                type={as ? undefined : type}
                as={as}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 placeholder:text-gray-400 ${as === 'textarea' ? 'min-h-[120px] resize-y' : ''}`}
            />
        </div>
        <ErrorMessage name={name} component="p" className="text-xs font-medium text-red-500 mt-0.5" />
    </div>
);

export default function JobForm({ isModal = false, onSuccess, onClose }: { isModal?: boolean; onSuccess?: () => void; onClose?: () => void }) {

    const handleSubmit = async (values: jobFormValues) => {
        try {
            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create job");
            }
            const data = await response.json();
            console.log(data);
            toast.success("Job created successfully");
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create job");
        }
    }

    if (isModal) {
        return (
            <div className="bg-white">
                <Formik
                    initialValues={{
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
                        <Form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    label="Job Title"
                                    name="title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    icon={HiOutlineBriefcase}
                                />
                                <FormField
                                    label="Company"
                                    name="company"
                                    placeholder="e.g. TechCorp Solutions"
                                    icon={HiOutlineOfficeBuilding}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    label="Location"
                                    name="location"
                                    placeholder="e.g. Remote / NY"
                                    icon={HiOutlineLocationMarker}
                                />
                                <FormField
                                    label="Salary"
                                    name="salary"
                                    placeholder="Enter salary"
                                    icon={HiOutlineCash}
                                />
                                <div className="grid grid-cols-2 gap-2">
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
                                                    placeholder="Type"
                                                    size="small"
                                                    error={!!(errors.type && touched.type)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
                                                            backgroundColor: '#f9fafb',
                                                            fontSize: '0.875rem',
                                                            '& fieldset': { borderColor: '#e5e7eb' },
                                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                        <ErrorMessage name="type" component="p" className="text-[10px] font-medium text-red-500" />
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
                                                    placeholder="Status"
                                                    size="small"
                                                    error={!!(errors.status && touched.status)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '8px',
                                                            backgroundColor: '#f9fafb',
                                                            fontSize: '0.875rem',
                                                            '& fieldset': { borderColor: '#e5e7eb' },
                                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                        <ErrorMessage name="status" component="p" className="text-[10px] font-medium text-red-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    label="Description"
                                    name="description"
                                    as="textarea"
                                    placeholder="Detailed description..."
                                    icon={HiOutlineDocumentText}
                                />

                                <FormField
                                    label="Requirements"
                                    name="requirements"
                                    as="textarea"
                                    placeholder="Key requirements..."
                                    icon={HiOutlineAcademicCap}
                                />

                                <FormField
                                    label="Responsibilities"
                                    name="responsibilities"
                                    as="textarea"
                                    placeholder="Day-to-day..."
                                    icon={HiOutlineClipboardList}
                                />

                                <FormField
                                    label="Notes"
                                    name="notes"
                                    as="textarea"
                                    placeholder="Notes..."
                                    icon={HiOutlineAnnotation}
                                />

                                <FormField
                                    label="Link"
                                    name="link"
                                    as="textarea"
                                    placeholder="Link to job..."
                                    icon={HiOutlineLink}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                {isModal && onClose && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Create Job Opportunity"
                                    )}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div >
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">Create New Job</h2>
                    <p className="text-blue-100 text-sm mt-1">Fill in the details below to post a new job opening.</p>
                </div>

                <Formik
                    initialValues={{
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
                        <Form className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    label="Job Title"
                                    name="title"
                                    placeholder="e.g. Senior Frontend Developer"
                                    icon={HiOutlineBriefcase}
                                />
                                <FormField
                                    label="Company"
                                    name="company"
                                    placeholder="e.g. TechCorp Solutions"
                                    icon={HiOutlineOfficeBuilding}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    label="Location"
                                    name="location"
                                    placeholder="e.g. Remote / New York, NY"
                                    icon={HiOutlineLocationMarker}
                                />
                                <FormField
                                    label="Salary (Optional)"
                                    name="salary"
                                    placeholder="e.g. $120k - $150k"
                                    icon={HiOutlineCash}
                                />
                                <div className="grid grid-cols-2 gap-4">
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
                                                    placeholder="Select Type"
                                                    error={!!(errors.type && touched.type)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '12px',
                                                            backgroundColor: '#f9fafb',
                                                            '& fieldset': { borderColor: '#e5e7eb' },
                                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                        <ErrorMessage name="type" component="p" className="text-xs font-medium text-red-500" />
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
                                                    placeholder="Select Status"
                                                    error={!!(errors.status && touched.status)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '12px',
                                                            backgroundColor: '#f9fafb',
                                                            '& fieldset': { borderColor: '#e5e7eb' },
                                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                                        },
                                                    }}
                                                />
                                            )}
                                        />
                                        <ErrorMessage name="status" component="p" className="text-xs font-medium text-red-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <FormField
                                    label="Description"
                                    name="description"
                                    as="textarea"
                                    placeholder="Detailed description of the role..."
                                    icon={HiOutlineDocumentText}
                                />
                                <FormField
                                    label="Requirements"
                                    name="requirements"
                                    as="textarea"
                                    placeholder="Key requirements for candidates..."
                                    icon={HiOutlineAcademicCap}
                                />
                                <FormField
                                    label="Responsibilities"
                                    name="responsibilities"
                                    as="textarea"
                                    placeholder="Day-to-day responsibilities..."
                                    icon={HiOutlineClipboardList}
                                />
                                <FormField
                                    label="Notes"
                                    name="notes"
                                    as="textarea"
                                    placeholder="Personal notes..."
                                    icon={HiOutlineAnnotation}
                                />
                                <FormField
                                    label="Link"
                                    name="link"
                                    as="textarea"
                                    placeholder="Link to job post..."
                                    icon={HiOutlineLink}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                                {onClose && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:transform-none flex items-center gap-2 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Create Job Opportunity"
                                    )}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
