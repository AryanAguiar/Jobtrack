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
}

export interface ScoreBreakdown {
    finalScore: number
    breakdown: {
        skills: number
        experience: number
        education: number
    }
}

export interface JobsProps {
    id: string;
    onClose: () => void;
}

export interface ResumesProps {
    id: string;
    onClose: () => void;
}

export interface AnalysisProps {
    id: string;

}

export interface AnalysisType {
    id: string;
    userId: string;
    resumeId: string;
    resumeTitle: string;
    jobTitle: string;
    matchScore: number;
    summary: string;
    breakdown: {
        skills: number
        experience: number
        education: number
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
    createdAt: Date;
    updatedAt: Date;
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
    parsedData?: {
        skills: string[];
        experience: any;
        education: any;
    };
}