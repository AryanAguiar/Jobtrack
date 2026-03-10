export interface JwtPayload {
    id: string;
}

export interface ResumeEvaluation {
    matchScore: number;
    summary: string;
    breakdown: {
        skills: number
        experience: number
        education: number
    };
    strengths: string[];
    gaps: string[];
    modelUsed: string;
    promptHash: string;
}
export interface ScoreInput {
    requiredSkills: string[]
    matchedSkills: string[]
    requiredYears: number
    candidateYears: number
    requiredEducation: string
    candidateEducation: string
    jobRole: string
    candidateRole: string
}

export interface ScoreBreakdown {
    finalScore: number
    breakdown: {
        skills: number
        experience: number
        education: number
        role: number
    }
}

export interface JobsProps {
    id: string;
}

export interface ResumesProps {
    id: string;
}

export interface AnalysisProps {
    id: string;

}

export interface AnalysisType {
    id: string;
    userId: string;
    resumeId: string;
    resumeTitle: string;
    resumeExpiry: Date;
    jobTitle: string;
    matchScore: number;
    summary: string;
    breakdown: {
        skills: number
        experience: number
        education: number
        role: number
    };
    parsedData: {
        skills: string[];
        experience: string[];
        education: string;
    };
    strengths: string[];
    gaps: string[];
    modelUsed: string;
    promptHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobType {
    id: string;
    userId: string;
    title: string;
    description: string;
    notes: string;
    company: string;
    location: string;
    salary: string;
    status: string;
    type: string;
    link: string;
    requirements: string;
    responsibilities: string;
    createdAt: string;
    updatedAt: string;
}

export interface ResumeType {
    id: string;
    userId: string;
    title: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    parsedData?: {
        skills: string[];
        experience: any;
        education: any;
    };
}

export interface jobFormValues {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string;
    responsibilities: string;
    salary: string;
    type: string;
    status: string;
}

export interface resumeFormValues {
    title: string;
    file: File;
}